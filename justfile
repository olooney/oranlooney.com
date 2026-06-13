set windows-shell := ["powershell.exe", "-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command"]

python := if os() == "windows" { "./.venv/Scripts/python.exe" } else { "./.venv/bin/python" }

default:
    just --list

serve:
    {{python}} ./scripts/dev-server.py

build:
    {{python}} ./scripts/dev-server.py build

clean:
    {{python}} ./scripts/clean.py

rebuild: clean build

thumbnails:
    {{python}} ./scripts/thumbnails.py

alias thumb := thumbnails
