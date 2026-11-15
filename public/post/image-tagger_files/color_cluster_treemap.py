#!/usr/bin/env python3
"""
Create a treemap of perceptual color clusters from an image.

Features:
- clusters pixels in CIELAB space using k-means
- finds N representative colors (default 20)
- sizes each swatch by pixel representation
- sorts clusters by hue (not by size)
- uses a squarified treemap / box-packing layout
- renders with no labels, borders, spacing, or padding by default

Usage:
    python color_cluster_treemap.py input_image.png
    python color_cluster_treemap.py input_image.png -o output.png --clusters 20

Dependencies:
    pip install numpy pillow matplotlib scikit-learn scikit-image
"""

from __future__ import annotations

import argparse
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
from sklearn.cluster import MiniBatchKMeans
from skimage.color import rgb2lab, lab2rgb
import matplotlib.colors as mcolors


# ---------------------------
# Treemap / squarify helpers
# ---------------------------
def normalize_sizes(sizes, dx, dy):
    total = float(sum(sizes))
    if total == 0:
        raise ValueError("All sizes are zero.")
    factor = dx * dy / total
    return [s * factor for s in sizes]


def worst_ratio(row, w):
    if not row or min(row) <= 0:
        return float("inf")
    s = sum(row)
    return max((w ** 2) * max(row) / (s ** 2), (s ** 2) / ((w ** 2) * min(row)))


def layout_row(row, x, y, dx, dy):
    rects = []
    if dx >= dy:  # lay out a horizontal row
        row_h = sum(row) / dx
        cur_x = x
        for r in row:
            rect_w = r / row_h
            rects.append(dict(x=cur_x, y=y, dx=rect_w, dy=row_h))
            cur_x += rect_w
        return rects, x, y + row_h, dx, dy - row_h
    else:  # lay out a vertical column
        row_w = sum(row) / dy
        cur_y = y
        for r in row:
            rect_h = r / row_w
            rects.append(dict(x=x, y=cur_y, dx=row_w, dy=rect_h))
            cur_y += rect_h
        return rects, x + row_w, y, dx - row_w, dy


def squarify_ordered(sizes, x, y, dx, dy):
    """
    Squarified treemap preserving input order.
    This lets us sort by hue first, then pack in that order.
    """
    sizes = list(sizes)
    rects = []
    row = []
    w = min(dx, dy)

    while sizes:
        c = sizes[0]
        if not row or worst_ratio(row + [c], w) <= worst_ratio(row, w):
            row.append(c)
            sizes.pop(0)
        else:
            new_rects, x, y, dx, dy = layout_row(row, x, y, dx, dy)
            rects.extend(new_rects)
            row = []
            w = min(dx, dy)

    if row:
        new_rects, x, y, dx, dy = layout_row(row, x, y, dx, dy)
        rects.extend(new_rects)

    return rects


# ---------------------------
# Core analysis
# ---------------------------
def cluster_colors(image_rgb, n_clusters=20, sample_size=250_000, random_state=0):
    """
    Cluster image pixels in CIELAB space and return RGB centroids + fractions.
    image_rgb: float array in [0,1], shape (H,W,3)
    """
    pixels_rgb = image_rgb.reshape(-1, 3)
    pixels_lab = rgb2lab(pixels_rgb.reshape(-1, 1, 3)).reshape(-1, 3)

    rng = np.random.default_rng(random_state)
    n_total = pixels_lab.shape[0]
    sample_n = min(sample_size, n_total)
    sample_idx = rng.choice(n_total, size=sample_n, replace=False)
    sample_lab = pixels_lab[sample_idx]

    kmeans = MiniBatchKMeans(
        n_clusters=n_clusters,
        random_state=random_state,
        batch_size=4096,
        n_init=10,
        max_iter=200,
    )
    kmeans.fit(sample_lab)

    labels = kmeans.predict(pixels_lab)
    centers_lab = kmeans.cluster_centers_
    counts = np.bincount(labels, minlength=n_clusters)
    fractions = counts / counts.sum()

    centers_rgb = lab2rgb(centers_lab.reshape(-1, 1, 3)).reshape(-1, 3)
    centers_rgb = np.clip(centers_rgb, 0, 1)

    return centers_rgb, fractions, centers_lab, counts



def sort_clusters_by_hue(centers_rgb, fractions, centers_lab=None, counts=None, neutral_sat_threshold=0.08):
    """
    Sort colors by HSV hue. Low-saturation colors are pushed to the end.
    """
    hsv = mcolors.rgb_to_hsv(centers_rgb)
    hues = hsv[:, 0]
    sats = hsv[:, 1]
    vals = hsv[:, 2]

    # Push low-saturation colors to the end, then sort those by brightness
    sort_key = np.where(sats < neutral_sat_threshold, 2.0 + vals, hues)
    order = np.argsort(sort_key)

    outputs = [centers_rgb[order], fractions[order], hues[order], sats[order], vals[order]]
    if centers_lab is not None:
        outputs.append(centers_lab[order])
    if counts is not None:
        outputs.append(counts[order])
    return outputs


# ---------------------------
# Rendering
# ---------------------------
def render_treemap(colors_rgb, fractions, output_path, width=100, height=100, figsize=(8, 8), dpi=200):
    sizes = normalize_sizes(fractions, width, height)
    rects = squarify_ordered(sizes, 0, 0, width, height)

    fig = plt.figure(figsize=figsize)
    ax = plt.gca()

    for rect, color in zip(rects, colors_rgb):
        x, y, dx, dy = rect["x"], rect["y"], rect["dx"], rect["dy"]
        ax.add_patch(
            plt.Rectangle(
                (x, y),
                dx,
                dy,
                facecolor=color,
                edgecolor="none",   # no borders
                linewidth=0,
                antialiased=False,
            )
        )

    ax.set_xlim(0, width)
    ax.set_ylim(height, 0)  # top-left origin like a treemap
    ax.set_aspect("equal")
    ax.axis("off")

    # Remove all outer padding / whitespace
    plt.subplots_adjust(left=0, right=1, top=1, bottom=0)
    plt.margins(0, 0)
    fig.savefig(output_path, dpi=dpi, bbox_inches="tight", pad_inches=0)
    plt.close(fig)


# ---------------------------
# CLI
# ---------------------------
def parse_args():
    p = argparse.ArgumentParser(description="Create a hue-ordered perceptual color cluster treemap from an image.")
    p.add_argument("input_image", help="Path to input image")
    p.add_argument("-o", "--output", default="color_clusters_treemap_clean.png", help="Output PNG path")
    p.add_argument("-k", "--clusters", type=int, default=20, help="Number of color clusters (default: 20)")
    p.add_argument("--sample-size", type=int, default=250_000, help="Max number of pixels to sample for fitting k-means")
    p.add_argument("--random-state", type=int, default=0, help="Random seed")
    p.add_argument("--size", type=float, default=8.0, help="Figure size in inches (default: 8)")
    p.add_argument("--dpi", type=int, default=200, help="Output DPI (default: 200)")
    return p.parse_args()



def main():
    args = parse_args()

    img = np.asarray(Image.open(args.input_image).convert("RGB"), dtype=np.float32) / 255.0

    centers_rgb, fractions, centers_lab, counts = cluster_colors(
        img,
        n_clusters=args.clusters,
        sample_size=args.sample_size,
        random_state=args.random_state,
    )

    centers_rgb, fractions, hues, sats, vals, centers_lab, counts = sort_clusters_by_hue(
        centers_rgb,
        fractions,
        centers_lab=centers_lab,
        counts=counts,
    )

    render_treemap(
        centers_rgb,
        fractions,
        output_path=args.output,
        figsize=(args.size, args.size),
        dpi=args.dpi,
    )

    print(f"Saved treemap to: {args.output}")
    print("\nCluster summary (sorted by hue):")
    for i, (rgb, frac) in enumerate(zip(centers_rgb, fractions), start=1):
        hex_color = "#{:02X}{:02X}{:02X}".format(*(np.round(rgb * 255).astype(int)))
        print(f"{i:>2}. {hex_color}   {frac * 100:>6.2f}%")


if __name__ == "__main__":
    main()
