import re
import os
import sys
from typing import Iterable, Iterator, Tuple

# ignore directories, notably "public/"
DEFAULT_IGNORE_DIRS = [
    'public',
    'helvetiker_font',
    '.git', 
    '.Rproj.user',
]

# ignore binary file extensions
DEFAULT_IGNORE_EXTS = [
    '.png', '.jpg', '.gif', '.mp3', '.mp4', '.jpeg', '.ico', '.ttf', 
    '.ogg', '.wav', 
    '.zip', '.tar', '.gz', '.gzip',
    '.pdf', '.xlsx', '.docx',
    '.RData', '.gitignore',
]

def grep_file(pattern: str, file_path: str) \
    -> Iterator[Tuple[str, int, str]]:
    '''Grep a single file. Yields (path, line_no, line) for every match.
    '''
    # attempt to open the file with the correct encoding
    try:
        file = open(file_path, 'r', encoding='utf-8')
        file.read()
        file.seek(0)
    except UnicodeDecodeError:
        file = open(file_path, 'r', encoding='latin-1')

    # search the file
    try:
        for line_index, line in enumerate(file):
            if re.search(pattern, line, re.IGNORECASE):
                yield file_path, line_index+1, line
    finally:
        file.close()


def grep_recursive(
    pattern: str, 
    directory: str, 
    ignore_dirs: Iterable[str] = DEFAULT_IGNORE_DIRS, 
    ignore_exts: Iterable[str] = DEFAULT_IGNORE_EXTS) \
    -> Iterator[Tuple[str, int, str]]:
    '''Search a directory structure recursively and grep every file.
    Yields (path, line_no, line) for every match.
    '''
    # materialize iterables as sets for fast, repeated searching.
    ignore_dirs = set(ignore_dirs)
    ignore_exts = set(ignore_exts)

    for root, dirs, files in os.walk(directory, topdown=True):
        # Modify the dirs list in place to ignore specified directories
        dirs[:] = [d for d in dirs if d not in ignore_dirs]

        for file in files:
            # Skip files with ignored extensions
            _, ext = os.path.splitext(file)
            if ext.lower() in ignore_exts:
                continue  

            # open the file somehow
            file_path = os.path.join(root, file)
            yield from grep_file(pattern, file_path)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py [PATTERN] [DIRECTORY]")
    else:
        for file_path, line_no, line in grep_recursive(
                pattern=sys.argv[1], 
                directory=sys.argv[2]):
            truncated_line = line.strip()[:120]
            print(f"{file_path}:{line_no}:{truncated_line}")

