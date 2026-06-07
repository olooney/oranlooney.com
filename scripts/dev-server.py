#!/usr/bin/env python3
"""
Development server that serves public/ and rebuilds on file changes.
Watches the project for modifications and runs blogdown::build_site() before serving requests.
"""

import os
import sys
import subprocess
import time
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path


class RebuildOnChangeHandler(SimpleHTTPRequestHandler):
    """HTTP handler that rebuilds the site before responding to requests."""
    
    last_build_time = 0
    
    def do_GET(self):
        """Handle GET requests with auto-rebuild."""
        if self.should_rebuild() or self.requested_path_missing():
            self.rebuild_site()
        
        # Serve the request
        super().do_GET()
    
    def requested_path_missing(self):
        """Check if the requested public file is missing and may need a rebuild."""
        translated_path = Path(self.translate_path(self.path))
        if translated_path.exists():
            return False

        if not self.path.endswith("/"):
            return True

        return not (translated_path / "index.html").exists()
    
    @classmethod
    def should_rebuild(cls):
        """Check if any project files have been modified since last build."""
        project_root = Path(__file__).parent.parent
        
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
    
    @classmethod
    def find_rscript(cls):
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
    def rebuild_site(cls):
        """Run blogdown::build_site() in R."""
        print("\n[dev-server] Rebuilding site...")
        
        rscript = cls.find_rscript()
        if not rscript:
            print("[dev-server] Error: Rscript not found. Install R or add it to PATH.")
            return False
        
        # Get the project root directory
        project_root = Path(__file__).parent.parent
        
        try:
            # Run the build and capture output while streaming it to console
            proc = subprocess.Popen(
                [rscript, "-e", "options(blogdown.server.verbose = TRUE); blogdown::build_site()"],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                cwd=str(project_root)
            )
            
            output_lines = []
            has_error = False
            
            assert proc.stdout is not None
            for line in proc.stdout:
                print(line, end='')
                output_lines.append(line)
                # Check for Hugo errors, but ignore the generic "logged 1 error(s)" message
                if line.startswith("Error:") and "logged 1 error(s)" not in line:
                    has_error = True
            
            proc.wait(timeout=60)
            
            if proc.returncode == 0 and not has_error:
                print("[dev-server] Build successful!")
                cls.last_build_time = time.time()
                return True
            else:
                if has_error:
                    print(f"\n[dev-server] ERROR: Build failed due to Hugo errors (see above)")
                else:
                    print(f"[dev-server] ERROR: Build failed with return code {proc.returncode}")
                return False
        
        except subprocess.TimeoutExpired:
            print("[dev-server] ERROR: Build timed out after 60 seconds.")
            return False
        except Exception as e:
            print(f"[dev-server] ERROR: Build error: {e}")
            return False
    
    def log_message(self, format, *args):
        """Log requests to stdout."""
        print(f"[dev-server] {format % args}")


def main():
    project_root = Path(__file__).parent.parent
    public_dir = project_root / "public"
    
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
        httpd.shutdown()


if __name__ == "__main__":
    main()
