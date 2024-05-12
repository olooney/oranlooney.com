import re
import os
import sys

def grep_recursive(
    pattern, 
    directory, 
    ignore_dirs=None, 
    ignore_exts=None):
    ignore_dirs = set(ignore_dirs or [])
    ignore_exts = set(ignore_exts or [])

    for root, dirs, files in os.walk(directory, topdown=True):
        # Modify the dirs list in place to ignore specified directories
        dirs[:] = [d for d in dirs if d not in ignore_dirs]

        for file in files:
            if any(file.endswith(ext) for ext in ignore_exts):
                continue  # Skip files with ignored extensions

            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        if re.search(pattern, line, re.IGNORECASE):
                            print(f"{file_path}: {line.strip()}")

            except Exception as e:
                # print(f"Failed to read {file_path}: {str(e)}")
                pass


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py [PATTERN] [DIRECTORY]")
    else:
        grep_recursive(
            pattern=sys.argv[1], 
            directory=sys.argv[2],
            ignore_dirs=[
                'public',
                'helvetiker_font',
                '.git', 
                '.Rproj.user'],
            ignore_exts=[
                'png', 'jpg', 'gif', 'mp3', 'mp4', 'jpeg', 'ico',
                'ttf', 
                'ogg', 'wav', 
                'zip', 'tar', 'gz', 'gzip',
                'pdf', 'xlsx', 'docx',
                'RData', 'gitignore', 
                ])

