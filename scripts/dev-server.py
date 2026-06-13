#!/usr/bin/env python3
"""
Development server that serves public/ and rebuilds on file changes.
Watches the project for modifications and runs blogdown::build_site() before serving requests.
"""

import os
import sys
import argparse
import subprocess
import time
from enum import Enum
from http import HTTPStatus
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path


class BuildStatus(Enum):
    SUCCESS = "success"
    FAILED = "failed"
    TIMEOUT = "timeout"


class RebuildOnChangeHandler(SimpleHTTPRequestHandler):
    """HTTP handler that rebuilds the site before responding to requests."""
    
    build_timeout_seconds = 20
    last_build_error = ""
    last_build_time = 0
    
    def do_GET(self) -> None:
        """Handle GET requests with auto-rebuild."""
        if self.should_rebuild() or self.requested_path_missing():
            if not self.rebuild_site():
                self.send_build_error()
                return
        
        # Serve the request
        super().do_GET()

    def send_build_error(self) -> None:
        """Send the latest build failure output as a plain-text 500 response."""
        body = self.last_build_error or "Build failed; no output was captured."
        encoded_body = body.encode("utf-8", "replace")

        self.send_response(HTTPStatus.INTERNAL_SERVER_ERROR)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded_body)))
        self.end_headers()
        self.wfile.write(encoded_body)
    
    def requested_path_missing(self) -> bool:
        """Check if the requested public file is missing and may need a rebuild."""
        translated_path = Path(self.translate_path(self.path))
        if translated_path.exists():
            return False

        if not self.path.endswith("/"):
            return True

        return not (translated_path / "index.html").exists()
    
    @classmethod
    def should_rebuild(cls) -> bool:
        """Check if any project files have been modified since last build."""
        project_root = Path(__file__).parent.parent

        if cls.public_is_empty(project_root):
            return True
        
        for path in project_root.rglob("*"):
            # Skip public/ directory and hidden files
            if "public" in path.parts or any(part.startswith(".") for part in path.parts):
                continue
            
            # Skip directories and common build artifacts
            if path.is_dir() or path.suffix in [".pyc", ".o"]:
                continue
            
            if path.is_file():
                mtime = path.stat().st_mtime
                if mtime > cls.last_build_time:
                    return True
        
        return False

    @staticmethod
    def public_is_empty(project_root: Path) -> bool:
        """Check if public/ exists but contains no generated files."""
        public_dir = project_root / "public"

        if not public_dir.is_dir():
            return False

        return not any(public_dir.iterdir())
    
    @classmethod
    def find_rscript(cls) -> str | None:
        """Find Rscript on Windows by checking common installation paths."""
        import shutil
        
        # Try in PATH first
        rscript = shutil.which("Rscript")
        if rscript:
            return rscript
        
        # Common Windows R installation paths
        common_paths = [
            r"C:\Program Files\R",
            r"C:\Program Files (x86)\R",
        ]
        
        for base_path in common_paths:
            if os.path.exists(base_path):
                # Find the R version folder
                for item in os.listdir(base_path):
                    rscript_path = os.path.join(base_path, item, "bin", "Rscript.exe")
                    if os.path.exists(rscript_path):
                        return rscript_path
        
        return None
    
    @classmethod
    def rebuild_site(cls) -> bool:
        """Run blogdown::build_site() in R."""
        for attempt in range(2):
            status = cls.run_build_once()
            if status is BuildStatus.TIMEOUT and attempt == 0:
                print("[dev-server] Retrying build after timeout...")
                continue

            return status is BuildStatus.SUCCESS

        return False

    @classmethod
    def run_build_once(cls) -> BuildStatus:
        """Run one blogdown build attempt and return success, failed, or timeout."""
        print("\n[dev-server] Rebuilding site...")
        
        rscript = cls.find_rscript()
        if not rscript:
            cls.print_and_store_build_error("[dev-server] Error: Rscript not found. Install R or add it to PATH.\n")
            return BuildStatus.FAILED
        
        # Get the project root directory
        project_root = Path(__file__).parent.parent
        
        try:
            proc = cls.start_build_process(rscript, project_root)
            output = cls.collect_build_output(proc)
            if output is None:
                return BuildStatus.TIMEOUT

            return cls.evaluate_build_output(proc.returncode, output)
        
        except Exception as e:
            cls.print_and_store_build_error(f"[dev-server] ERROR: Build error: {e}\n")
            return BuildStatus.FAILED

    @classmethod
    def start_build_process(cls, rscript: str, project_root: Path) -> subprocess.Popen[str]:
        """Start the R build subprocess."""
        return subprocess.Popen(
            [rscript, "-e", "options(blogdown.server.verbose = TRUE); blogdown::build_site()"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            cwd=str(project_root)
        )

    @classmethod
    def collect_build_output(cls, proc: subprocess.Popen[str]) -> str | None:
        """Collect build output, killing the process if it times out."""
        try:
            output, _ = proc.communicate(timeout=cls.build_timeout_seconds)
            return output
        except subprocess.TimeoutExpired:
            proc.kill()
            output, _ = proc.communicate()
            timeout_message = f"[dev-server] ERROR: Build timed out after {cls.build_timeout_seconds} seconds.\n"
            cls.print_and_store_build_error(output + timeout_message)
            return None

    @classmethod
    def evaluate_build_output(cls, returncode: int | None, output: str) -> BuildStatus:
        """Print build output and classify the build result."""
        has_error = cls.print_build_output(output)

        if returncode == 0 and not has_error:
            print("[dev-server] Build successful!")
            cls.last_build_error = ""
            cls.last_build_time = time.time()
            return BuildStatus.SUCCESS

        if has_error:
            summary = "\n[dev-server] ERROR: Build failed due to Hugo errors (see above)\n"
            print(summary, end='')
            cls.last_build_error = output + summary
        else:
            summary = f"[dev-server] ERROR: Build failed with return code {returncode}\n"
            print(summary, end='')
            cls.last_build_error = output + summary

        return BuildStatus.FAILED

    @classmethod
    def print_and_store_build_error(cls, output: str) -> None:
        """Print and store build output for the next HTTP 500 response."""
        print(output, end='')
        cls.last_build_error = output

    @staticmethod
    def print_build_output(output: str) -> bool:
        """Print build output and return whether it contains Hugo errors."""
        has_error = False

        for line in output.splitlines(keepends=True):
            print(line, end='')
            if RebuildOnChangeHandler.line_indicates_build_error(line):
                has_error = True

        return has_error

    @staticmethod
    def line_indicates_build_error(line: str) -> bool:
        """Check whether a build output line indicates Hugo failed."""
        stripped_line = line.strip()

        if stripped_line.startswith("Error:") and "logged 1 error(s)" not in stripped_line:
            return True

        return stripped_line.startswith("panic:")
    
    def log_message(self, format: str, *args: object) -> None:
        """Log requests to stdout."""
        print(f"[dev-server] {format % args}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Build the site or serve public/ with rebuilds on changes.")
    parser.add_argument(
        "mode",
        choices=["build", "serve"],
        default="serve",
        nargs="?",
        help="run a one-shot build or start the development server (default: serve)",
    )
    args = parser.parse_args()

    project_root = Path(__file__).parent.parent
    public_dir = project_root / "public"

    if args.mode == "build":
        success = RebuildOnChangeHandler.rebuild_site()
        sys.exit(0 if success else 1)
    
    if not public_dir.exists():
        print(f"Error: {public_dir} does not exist. Run blogdown::build_site() first.")
        sys.exit(1)
    
    # Change to public directory to serve from there
    os.chdir(public_dir)
    
    port = 8080
    server_address = ("", port)
    
    httpd = HTTPServer(server_address, RebuildOnChangeHandler)
    
    RebuildOnChangeHandler.rebuild_site()
    
    print(f"Development server running at http://localhost:{port}")
    print(f"Serving from: {public_dir}")
    print("Press Ctrl+C to stop.\n")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        sys.exit(0)
    finally:
        httpd.server_close()


if __name__ == "__main__":
    main()
