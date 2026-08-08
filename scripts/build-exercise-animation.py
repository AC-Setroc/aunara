#!/usr/bin/env python3
"""Build a looping Aunara exercise animation from a 2x2 keyframe sheet."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="Square 2x2 keyframe sheet")
    parser.add_argument("output_dir", type=Path)
    parser.add_argument("--slug", default="exercise-aunara-v1")
    parser.add_argument("--size", type=int, default=560)
    parser.add_argument("--gutter", type=int, default=6)
    parser.add_argument("--lower-row-lift", type=int, default=36)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    sheet = Image.open(args.source).convert("RGB")
    if sheet.width != sheet.height:
        raise ValueError("The keyframe sheet must be square.")

    half = sheet.width // 2
    inset = args.gutter // 2
    boxes = [
        (0, 0, half - inset, half - inset),
        (half + inset, 0, sheet.width, half - inset),
        (0, half + inset, half - inset, sheet.height),
        (half + inset, half + inset, sheet.width, sheet.height),
    ]

    frames: list[Image.Image] = []
    for index, box in enumerate(boxes):
        frame = sheet.crop(box)
        if index >= 2 and args.lower_row_lift:
            aligned = Image.new("RGB", frame.size, "#F5F1EA")
            aligned.paste(frame, (0, -args.lower_row_lift))
            frame = aligned
        frame.thumbnail((args.size, args.size), Image.Resampling.LANCZOS)
        canvas = Image.new("RGB", (args.size, args.size), "#F5F1EA")
        canvas.paste(frame, ((args.size - frame.width) // 2, (args.size - frame.height) // 2))
        frames.append(canvas)

    sequence = [frames[index] for index in (0, 1, 2, 3, 2, 1)]
    durations = [420, 140, 140, 420, 140, 140]
    args.output_dir.mkdir(parents=True, exist_ok=True)

    gif_frames = [frame.quantize(colors=128, method=Image.Quantize.MEDIANCUT) for frame in sequence]
    gif_frames[0].save(
        args.output_dir / f"{args.slug}.gif",
        save_all=True,
        append_images=gif_frames[1:],
        duration=durations,
        loop=0,
        disposal=2,
        optimize=True,
    )
    sequence[0].save(
        args.output_dir / f"{args.slug}.webp",
        save_all=True,
        append_images=sequence[1:],
        duration=durations,
        loop=0,
        quality=88,
        method=6,
    )


if __name__ == "__main__":
    main()
