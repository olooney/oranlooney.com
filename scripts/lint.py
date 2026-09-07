from pathlib import Path
import argparse
import re

UTF8_BOM = b"\xef\xbb\xbf"

FIXES = {
    # Quotes
    "\u2018": "'",  # left single quote
    "\u2019": "'",  # right single quote
    "\u201c": '"',  # left double quote
    "\u201d": '"',  # right double quote

    # Dashes
    "\u2014": "&mdash;",  # em dash
    "\u2013": "-",        # en dash
    "\u2212": "-",        # minus sign

    # Punctuation
    "\u2026": "...",      # ellipsis

    # Spaces
    "\u00a0": " ",        # non-breaking space
    "\u202f": " ",        # narrow non-breaking space
}

WHITELIST = set(
    # Latin letters with diacritics
    "àáâäãå"
    "ç"
    "èéêë"
    "ìíîï"
    "ñ"
    "òóôöõő"
    "ùúûü"
    "ýÿ"
    "ÀÁÂÄÃÅ"
    "Ç"
    "ÈÉÊË"
    "ÌÍÎÏ"
    "Ñ"
    "ÒÓÔÖÕŐ"
    "ÙÚÛÜ"
    "Ý"
    "āēīōū"
    "ĀĒĪŌŪ"
    "æÆ"
    "±×™½"
)

JAPANESE_REGEX = re.compile(
    r"["
    r"\u3040-\u309f"  # Hiragana
    r"\u30a0-\u30ff"  # Katakana
    r"\u31f0-\u31ff"  # Katakana extensions
    r"\u3400-\u4dbf"  # Kanji extension A
    r"\u4e00-\u9fff"  # Kanji
    r"]"
)

FIX_REGEX = re.compile("|".join(map(re.escape, FIXES)) +  r"|[^\x00-\x7F]+")

class FixError(ValueError):
    pass

def fix(line_number: int, line: str) -> str:

    def fixer(match: re.Match) -> str:
        value = match.group()

        if value in WHITELIST:
            return value

        if JAPANESE_REGEX.match(value):
            return value
        
        fixed = FIXES.get(value, None)
        if fixed is None:
            raise FixError(f"Unfixable non-ASCII value: {value!r} on line {line_number}\n{line}")
        return fixed
        
    return FIX_REGEX.sub(fixer, line)

def build_arg_parser():
    parser = argparse.ArgumentParser(description="Lints markdown files to ensure they're pure ASCII.")
    parser.add_argument("--dry-run", "-d", action="store_true", help="Make no changes but report errors found.")
    parser.add_argument("--verbose", "-v", action="count", default=1)
    parser.add_argument("--quiet", "-q", action="count", default=0)
    parser.add_argument("path", nargs="?", default="./content/", help="path to search for .md files.")

    return parser

def caret_diff(line: str, fixed: str) -> str:
    diff = [ (" " if cl == cf else "^") for cl, cf in zip(line, fixed) ]
    return "".join(diff)

def main(args: argparse.Namespace):
    total_problems = 0
    action_taken = "found" if args.dry_run else "fixed"
    filenames = list(Path(args.path).rglob("*.md"))

    for filename in filenames:
        if args.verbose >= 3:
            print(f"scanning {filename} ... ", end="")

        with open(filename, "rb") as f:
            has_bom = f.read(3) == b"\xef\xbb\xbf"
        if has_bom:
            total_problems += 1
            print("UTF BOM Detected!")

        with open(filename, encoding='utf-8-sig') as file:
            lines = file.readlines()

        try:
            fixed_lines = [ fix(index+1, line) for index, line in enumerate(lines) ]
        except FixError as ex:
            print(f"\nfile {filename}: {ex}")
            continue

        fixed_line_count = 0
        for index, (fixed, line) in enumerate(zip(fixed_lines, lines)):    
            if fixed != line:
                fixed_line_count += 1
                if args.verbose >= 2:
                    print(f"\n-{index+1:>4}: {line.rstrip()}")
                    print(f"+{index+1:>4}: {fixed.rstrip()}")
                    print(f"       {caret_diff(line, fixed)}")

        total_problems += fixed_line_count

        if fixed_line_count == 0 and not has_bom:
            if args.verbose >= 3:
                print("no problems found.")
        else:
            if not args.dry_run:
                with open(filename, "w", encoding="utf-8") as file:
                    file.writelines(fixed_lines)

            if args.verbose < 3:
                print(f"scanned {filename} : ", end="")

            if args.verbose >= 1:
                if has_bom and fixed_line_count == 0:
                    print("removed UTF BOM.")
                else:
                    and_removed_bom = " and removed UTF BOM" if has_bom else ""
                    print(f"{fixed_line_count} problems {action_taken}{and_removed_bom}.")

    if args.verbose >= 1:
        print(f"scanned {len(filenames)} files and {action_taken} {total_problems} problems total.")

    

if __name__ == "__main__":
    parser = build_arg_parser()
    args = parser.parse_args()
    args.verbose = args.verbose - args.quiet
    main(args)
