#!/usr/bin/env python3

import shutil
from pathlib import Path


def main() -> None:
    project_root = Path(__file__).resolve().parent.parent
    public_dir = project_root / "public"

    if not public_dir.is_dir():
        raise SystemExit(f"public directory not found: {public_dir}")

    for path in public_dir.iterdir():
        if path.is_dir() and not path.is_symlink():
            shutil.rmtree(path)
        else:
            path.unlink()


if __name__ == "__main__":
    main()