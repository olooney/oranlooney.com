#!/usr/bin/env python3
# Counts GET /post/{name}/ requests per hour (excluding /post/{name}/lead.jpg)
# Prints fixed-width columns: datetime, name, count

import re
from datetime import datetime, timedelta, timezone
import polars as pl
from urllib.parse import urlparse

LOG_FILE = "/var/log/nginx/access.log"

# Nginx "combined" log line matcher (method, path, timestamp)
LINE_RE = re.compile(
    r'^\S+ \S+ \S+ \[(?P<ts>[^\]]+)\] "(?P<method>\S+) (?P<path>\S+) \S+" \d{3} \S+ "(?P<referer>[^"]*)"'
)

# exact /post/{name}/ matcher; excludes .../lead.jpg implicitly
POST_RE = re.compile(r"^/post/(?P<name>[^/]+)/$")

def print_markdown_header(title: str) -> None:
    print()
    print(title)
    print("-" * len(title))
    print()

rows = []
with open(LOG_FILE, "rt", encoding="utf-8", errors="ignore") as f:
    for line in f:
        m = LINE_RE.match(line)
        if not m:
            continue
        if m.group("method") != "GET":
            continue
        path = m.group("path")
        pm = POST_RE.match(path)
        if not pm:
            continue  # skips /post/{name}/lead.jpg and any other non-exact paths
        rows.append({
            "ts_raw": m.group("ts"),
            "name": pm.group("name"),
            "referer": m.group("referer"),
        })

if not rows:
    print(f'{"datetime":<19} {"name":<20} {"count":>5}')
    exit(0)

df = pl.DataFrame(rows)

# parse "[10/Oct/2000:13:55:36 +0000]" timestamps
df = df.with_columns(
    ts=pl.col("ts_raw").str.strptime(
        pl.Datetime, format="%d/%b/%Y:%H:%M:%S %z", strict=False, exact=True
    )
).drop("ts_raw")

# normalize to UTC, then truncate to hour
df = df.with_columns(
    # ts_utc=pl.col("ts").dt.convert_time_zone("UTC"),
    day=pl.col("ts").dt.convert_time_zone("UTC").dt.truncate(every="1d"),
).drop("ts")

# counts per hour per name
counts = (
    df.group_by(["day", "name"])
    .len()
    .rename({"len": "count"})
)

start_date = datetime.now(timezone.utc) - timedelta(days=14)
report = (
    counts
    .filter(pl.col("day") >= start_date)
    .filter(pl.col("count") >= 10)
    .with_columns(dow=pl.col("day").dt.strftime("%a"))
    .sort(["day", "count", "name"], descending=[False, True, False])
)

# print fixed-width report: datetime(YYYY-MM-DD HH:00), name, count
DATE_W = 19  # "YYYY-MM-DD HH:00"
DOW_W = 3 # "Fri"
max_name_len = (
    report.select(pl.col("name").str.len_chars().max().fill_null(0)).to_series().item()
)
NAME_W = max(20, int(max_name_len))
COUNT_W = 5

print_markdown_header("Daily Breakdown")

header = f'{"datetime":<{DATE_W}} {"name":<{NAME_W}} {"count":>{COUNT_W}}'
print(header)
print("-" * len(header))

prev_day = None
for day, dow, name, count in report.select(["day", "dow", "name", "count"]).iter_rows():
    if day != prev_day:
        print()
    prev_day = day
    day_str = day.strftime("%Y-%m-%d")
    print(f"{day_str:<{DATE_W}} {dow:<{DOW_W}} {name:<{NAME_W}} {int(count):>{COUNT_W}}")

print()

n_days = (datetime.now(timezone.utc) - start_date).days
label = f"Last {n_days} Days"

summary = (
    counts
    .filter(pl.col("day") >= start_date)
    .group_by("name")
    .agg(pl.col("count").sum())
    .filter(pl.col("count") >= 10 * n_days)
    .sort(["count", "name"], descending=[True, False])
)

STARS_W = 10

max_count = summary.select(pl.col("count")).max().to_series().item()

summary= summary.with_columns(
    stars=(pl.col("count") * STARS_W /max_count).floor().cast(pl.Int64)
)

print_markdown_header(f"Total - Last {n_days} Days")

for name, count, stars in summary.iter_rows():
    print(f"{name:<{NAME_W}} {int(count):>{COUNT_W}} {'*'*stars:<{STARS_W}}")


# Referer Analysis

def referer_domain(referer: str) -> str:
    if not referer or referer == "-":
        return "(direct)"
    domain = urlparse(referer).netloc.lower()
    return domain.removeprefix("www.") or "(unknown)"


EXCLUDE_SOURCES = [
    "oranlooney.com",
    "www.oranlooney.com",
    "green.oranlooney.com",
    "staging.oranlooney.com",
    "(direct)"
]

traffic_sources = (
    df
    .filter(pl.col("day") >= start_date)
    .with_columns(
        source=pl.col("referer").map_elements(referer_domain, return_dtype=pl.String)
    )
    .filter(~pl.col("source").is_in(EXCLUDE_SOURCES))
    .group_by("source")
    .len()
    .rename({"len": "count"})
    .filter(pl.col("count") >= 5)
    .sort(["count", "source"], descending=[True, False])
)

max_source_count = traffic_sources.select(pl.col("count")).max().to_series().item()

traffic_sources = traffic_sources.with_columns(
    stars=(pl.col("count") * STARS_W / max_source_count).floor().cast(pl.Int64)
)

print_markdown_header(f"External Traffic Sources - Last {n_days} Days")

for source, count, stars in traffic_sources.iter_rows():
    print(f"{source:<{NAME_W}} {int(count):>{COUNT_W}} {'*' * stars:<{STARS_W}}")



# Human vs. Bot

# Capture referer and user-agent from nginx combined logs
LINE_RE = re.compile(
    r'^\S+ \S+ \S+ '
    r'\[(?P<ts>[^\]]+)\] '
    r'"(?P<method>\S+) (?P<path>\S+) \S+" '
    r'\d{3} \S+ '
    r'"(?P<referer>[^"]*)" '
    r'"(?P<ua>[^"]*)"'
)

BOT_PATTERNS = [
    r'bot',
    r'spider',
    r'crawler',
    r'crawl',
    r'scrapy',
    r'curl',
    r'wget',
    r'python',
    r'httpclient',
    r'feedfetcher',
    r'facebookexternalhit',
    r'slackbot',
    r'discordbot',
    r'googlebot',
    r'bingbot',
    r'GPTBot',
    r'ClaudeBot',
    r'PerplexityBot',
    r'Bytespider',
]

BOT_RE = re.compile("|".join(BOT_PATTERNS), re.I)


def traffic_class(ua: str) -> str:
    if not ua:
        return "unknown"
    return "bot" if BOT_RE.search(ua) else "human"


rows = []
with open(LOG_FILE, "rt", encoding="utf-8", errors="ignore") as f:
    for line in f:
        m = LINE_RE.match(line)
        if not m:
            continue
        if m.group("method") != "GET":
            continue

        path = m.group("path")
        pm = POST_RE.match(path)
        if not pm:
            continue

        rows.append({
            "ts_raw": m.group("ts"),
            "name": pm.group("name"),
            "referer": m.group("referer"),
            "ua": m.group("ua"),
        })

df = pl.DataFrame(rows)

df = (
    df
    .with_columns(
        ts=pl.col("ts_raw").str.strptime(
            pl.Datetime,
            format="%d/%b/%Y:%H:%M:%S %z",
            strict=False,
            exact=True,
        )
    )
    .drop("ts_raw")
    .with_columns(
        day=pl.col("ts").dt.convert_time_zone("UTC").dt.truncate(every="1d"),
        traffic=pl.col("ua").map_elements(
            traffic_class,
            return_dtype=pl.String,
        ),
    )
    .drop("ts")
)

human_summary = (
    df
    .filter(pl.col("day") >= start_date)
    .filter(pl.col("traffic") == "human")
    .group_by("name")
    .len()
    .rename({"len": "count"})
    .filter(pl.col("count") >= 10 * n_days)
    .sort(["count", "name"], descending=[True, False])
)

max_count = human_summary.select(pl.col("count")).max().to_series().item()

human_summary = human_summary.with_columns(
    stars=(pl.col("count") * STARS_W / max_count).floor().cast(pl.Int64)
)

print_markdown_header(f"Human Traffic - Last {n_days} Days")

for name, count, stars in human_summary.iter_rows():
    print(f"{name:<{NAME_W}} {int(count):>{COUNT_W}} {'*' * stars:<{STARS_W}}")

