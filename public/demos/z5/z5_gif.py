from PIL import Image
import numpy as np
from pathlib import Path
import imageio.v3 as iio


def random_walk_z5_mp4(
    width=256,
    height=256,
    strides=(1, 1, 3, 3, 3),
    n_iterations=5_000_000,
    seed=37,
    upscale=4,
    fill_threshold=0.90,
    n_frames=1500,
    fps=25,
    output_path="z5.mp4",
):
    rng = np.random.default_rng(seed)

    bounds = np.array([height, width, 256, 256, 256], dtype=int)

    vector = rng.integers(0, bounds, dtype=int)

    image = np.zeros((height, width, 3), dtype=np.uint8)

    nonblack = np.zeros((height, width), dtype=bool)
    filled_count = 0
    total_pixels = width * height

    threshold_iteration = None
    capture_indices = set()

    frames = []

    for iteration in range(n_iterations):
        axis = rng.integers(0, 5)
        stride = strides[axis]
        step = rng.choice((-stride, stride))

        vector[axis] = (vector[axis] + step) % bounds[axis]

        y, x = int(vector[0]), int(vector[1])
        color = vector[2:].astype(np.uint8)

        image[y, x] = color

        if not np.all(color == 0):
            if not nonblack[y, x]:
                nonblack[y, x] = True
                filled_count += 1

        fill_fraction = filled_count / total_pixels

        if threshold_iteration is None and fill_fraction >= fill_threshold:
            threshold_iteration = iteration

            sample_points = np.linspace(
                iteration,
                n_iterations - 1,
                n_frames,
                dtype=int,
            )

            capture_indices = set(sample_points.tolist())

        if iteration in capture_indices:
            frame = Image.fromarray(image.copy())

            frame = frame.resize(
                (width * upscale, height * upscale),
                Image.Resampling.NEAREST,
            )

            frames.append(np.array(frame))

    # Always append the final frame
    final_frame = Image.fromarray(image.copy()).resize(
        (width * upscale, height * upscale),
        Image.Resampling.NEAREST,
    )

    frames.append(np.array(final_frame))

    # Write MP4 using H.264
    iio.imwrite(
        output_path,
        frames,
        fps=fps,
        codec="libx264",
        quality=8,
    )

    print(f"Threshold reached at iteration: {threshold_iteration}")
    print(f"Final fill fraction: {fill_fraction:.4f}")
    print(f"Frames saved: {len(frames)}")
    print(f"Output: {Path(output_path).resolve()}")


if __name__ == "__main__":
    random_walk_z5_mp4()
