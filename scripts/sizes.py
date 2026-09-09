from pathlib import Path
import argparse

import polars as pl


ROOT = Path(__file__).resolve().parent.parent

IGNORE_DIRS = {"renv"}
IGNORE_PATHS = {Path("public/static")}

IMAGE_EXTENSIONS = {
    ".avif",
    ".bmp",
    ".gif",
    ".ico",
    ".jpeg",
    ".jpg",
    ".png",
    ".svg",
    ".tif",
    ".tiff",
    ".webp",
}

MEDIA_EXTENSIONS = {
    ".aac",
    ".avi",
    ".flac",
    ".m4a",
    ".mkv",
    ".mov",
    ".mp3",
    ".mp4",
    ".ogg",
    ".ttf",
    ".wav",
    ".webm",
}

CODE_EXTENSIONS = {".css", ".drawio", ".js", ".py", ".scss"}
DOCUMENT_EXTENSIONS = {".docx", ".pdf", ".xlsx"}
TEXT_EXTENSIONS = {".md", ".rmd", ".txt"}


def kibibytes(byte_count: int) -> str:
    return f"{round(byte_count / 1024):,}"


def percent(part: int, total: int) -> str:
    if total == 0:
        return "0.00%"
    return f"{part * 100 / total:.2f}%"


def format_row(row: dict, name_column: str) -> dict:
    return {
        name_column: row[name_column],
        "Files": f"{row['files']:,}",
        "Size (KiB)": kibibytes(row["bytes"]),
        "Percent": percent(row["bytes"], row["total_bytes"]),
    }


def total_row(rows: list[dict], name_column: str) -> dict:
    return {
        name_column: "Total:",
        "files": sum(row["files"] for row in rows),
        "bytes": sum(row["bytes"] for row in rows),
        "total_bytes": rows[0]["total_bytes"] if rows else 0,
    }


def column_widths(rows: list[dict], name_column: str) -> dict[str, int]:
    headers = [name_column, "Files", "Size (KiB)", "Percent"]
    rendered_rows = [format_row(row, name_column) for row in rows]
    return {
        header: max(len(header), *(len(row[header]) for row in rendered_rows))
        for header in headers
    }


def print_table(rows: list[dict], name_column: str, widths: dict[str, int] | None = None, show_total: bool = True) -> None:
    headers = [name_column, "Files", "Size (KiB)", "Percent"]
    rendered_rows = [format_row(row, name_column) for row in rows]
    rendered_total = format_row(total_row(rows, name_column), name_column)
    if widths is None:
        widths = column_widths([*rows, total_row(rows, name_column)], name_column)

    print(
        f"{headers[0]:<{widths[headers[0]]}}  "
        f"{headers[1]:>{widths[headers[1]]}}  "
        f"{headers[2]:>{widths[headers[2]]}}  "
        f"{headers[3]:>{widths[headers[3]]}}"
    )
    print(
        f"{'-' * widths[headers[0]]}  "
        f"{'-' * widths[headers[1]]}  "
        f"{'-' * widths[headers[2]]}  "
        f"{'-' * widths[headers[3]]}"
    )
    for row in rendered_rows:
        print(
            f"{row[headers[0]]:<{widths[headers[0]]}}  "
            f"{row[headers[1]]:>{widths[headers[1]]}}  "
            f"{row[headers[2]]:>{widths[headers[2]]}}  "
            f"{row[headers[3]]:>{widths[headers[3]]}}"
        )
    if show_total:
        print(
            f"{'-' * widths[headers[0]]}  "
            f"{'-' * widths[headers[1]]}  "
            f"{'-' * widths[headers[2]]}  "
            f"{'-' * widths[headers[3]]}"
        )
        print(
            f"{rendered_total[headers[0]]:<{widths[headers[0]]}}  "
            f"{rendered_total[headers[1]]:>{widths[headers[1]]}}  "
            f"{rendered_total[headers[2]]:>{widths[headers[2]]}}  "
            f"{rendered_total[headers[3]]:>{widths[headers[3]]}}"
        )


def print_total_line(row: dict, name_column: str, widths: dict[str, int]) -> None:
    headers = [name_column, "Files", "Size (KiB)", "Percent"]
    rendered_row = format_row(row, name_column)

    print(
        f"{'-' * widths[headers[0]]}  "
        f"{'-' * widths[headers[1]]}  "
        f"{'-' * widths[headers[2]]}  "
        f"{'-' * widths[headers[3]]}"
    )
    print(
        f"{rendered_row[headers[0]]:<{widths[headers[0]]}}  "
        f"{rendered_row[headers[1]]:>{widths[headers[1]]}}  "
        f"{rendered_row[headers[2]]:>{widths[headers[2]]}}  "
        f"{rendered_row[headers[3]]:>{widths[headers[3]]}}"
    )


def should_ignore(path: Path) -> bool:
    relative_path = path.relative_to(ROOT)

    if any(part.startswith(".") or part in IGNORE_DIRS for part in relative_path.parts):
        return True

    return any(
        relative_path == ignored_path or relative_path.is_relative_to(ignored_path)
        for ignored_path in IGNORE_PATHS
    )


def bucket_for(path: Path) -> tuple[str, str]:
    relative_path = path.relative_to(ROOT)
    top_level = relative_path.parts[0] if relative_path.parts else ""
    extension = path.suffix.lower() or "[no extension]"

    if len(relative_path.parts) >= 2 and relative_path.parts[:3] == ("public", "demos", "desktop"):
        bucket = "desktop"
    elif extension == "[no extension]" and top_level == "scripts":
        bucket = "code"
    elif extension in IMAGE_EXTENSIONS:
        bucket = "images"
    elif extension in MEDIA_EXTENSIONS:
        bucket = "media"
    elif extension in CODE_EXTENSIONS:
        bucket = "code"
    elif extension in DOCUMENT_EXTENSIONS:
        bucket = "documents"
    elif extension in TEXT_EXTENSIONS:
        bucket = "text"
    elif extension == ".ipynb":
        bucket = "notebooks"
    elif extension == ".html":
        bucket = "templates" if top_level == "layouts" else "html"
    else:
        bucket = "other"

    return bucket, extension


def build_dataframe() -> pl.DataFrame:
    rows = []

    for path in ROOT.rglob("*"):
        if not path.is_file() or should_ignore(path):
            continue

        bucket, extension = bucket_for(path)
        rows.append(
            {
                "bucket": bucket,
                "extension": extension,
                "path": str(path.relative_to(ROOT)).replace("\\", "/"),
                "bytes": path.stat().st_size,
            }
        )

    return pl.DataFrame(rows)


def summarize(files: pl.DataFrame) -> pl.DataFrame:
    total_bytes = files["bytes"].sum()

    return (
        files.group_by("bucket")
        .agg(
            pl.len().alias("files"),
            pl.sum("bytes").alias("bytes"),
        )
        .with_columns(pl.lit(total_bytes).alias("total_bytes"))
        .sort("bytes", descending=True)
        .select("bucket", "files", "bytes", "total_bytes")
    )


def summarize_extensions(files: pl.DataFrame) -> pl.DataFrame:
    total_bytes = files["bytes"].sum()

    return (
        files.group_by("bucket", "extension")
        .agg(
            pl.len().alias("files"),
            pl.sum("bytes").alias("bytes"),
        )
        .with_columns(pl.lit(total_bytes).alias("total_bytes"))
    )


def print_full_summary(files: pl.DataFrame) -> None:
    bucket_summary = summarize(files)
    extension_summary = summarize_extensions(files)
    all_rows = [
        dict(row)
        for row in (
            extension_summary
            .select("extension", "files", "bytes", "total_bytes")
            .iter_rows(named=True)
        )
    ]
    total_files = files.height
    total_bytes = int(files["bytes"].sum() or 0)
    grand_total = {
        "extension": "Total:",
        "files": total_files,
        "bytes": total_bytes,
        "total_bytes": total_bytes,
    }
    widths = column_widths([*all_rows, grand_total], "extension")

    for bucket in bucket_summary["bucket"]:
        bucket_rows = [
            dict(row)
            for row in (
            extension_summary.filter(pl.col("bucket") == bucket)
            .sort("bytes", descending=True)
            .select("extension", "files", "bytes", "total_bytes")
            .iter_rows(named=True)
            )
        ]

        print(bucket.title())
        print_table(bucket_rows, "extension", widths, show_total=len(bucket_rows) > 1)
        print()

    print_total_line(grand_total, "extension", widths)


def print_summary(files: pl.DataFrame) -> None:
    rows = [
        dict(row)
        for row in (
            summarize(files)
            .select("bucket", "files", "bytes", "total_bytes")
            .iter_rows(named=True)
        )
    ]
    print_table(rows, "bucket")


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Reports repository file sizes by bucket.")
    parser.add_argument("--full", action="store_true", help="Show extension details within each bucket.")
    return parser


def main(args: argparse.Namespace) -> None:
    files = build_dataframe()

    if args.full:
        print_full_summary(files)
    else:
        print_summary(files)


if __name__ == "__main__":
    main(build_arg_parser().parse_args())