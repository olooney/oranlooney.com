#!/usr/bin/env python3

import argparse
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent


def git_output(*args: str) -> str | None:
    result = subprocess.run(
        ["git", "-C", str(ROOT), *args],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        return None
    return result.stdout.strip()


def check_configuration() -> tuple[bool, str]:
    attribute = git_output("check-attr", "merge", "--", "public/index.json")
    if attribute != "public/index.json: merge: ours":
        return False, "public/index.json is not assigned the ours merge driver in .gitattributes"

    driver = git_output("config", "--local", "--get", "merge.ours.driver")
    if driver != "true":
        return False, "the local merge.ours.driver is not set to true"

    return True, ""


def main() -> int:
    parser = argparse.ArgumentParser(description="Configure the local public/index.json merge driver.")
    parser.add_argument("--check", action="store_true", help="check the configuration without changing it")
    args = parser.parse_args()

    if not args.check:
        result = subprocess.run(
            ["git", "-C", str(ROOT), "config", "--local", "merge.ours.driver", "true"],
            check=False,
        )
        if result.returncode != 0:
            return result.returncode

    configured, reason = check_configuration()
    if configured:
        print("public/index.json merge driver is configured.")
        return 0

    print(f"public/index.json merge driver is not configured: {reason}.")
    if args.check:
        print("Run `just setup-merge-driver` to configure it.")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())