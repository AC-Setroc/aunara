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
    parser.add_argument("--layout", default="2x2", choices=["2x2", "1x2", "2x1", "1x3", "1x4"], help="Keyframe layout in sheet")
    parser.add_argument("--size", type=int, default=560)
    parser.add_argument("--gutter", type=int, default=6)
    parser.add_argument("--lower-row-lift", type=int, default=0)
    parser.add_argument("--blend-steps", type=int, default=2, help="Number of cross-fade blended frames between keyframes")
    parser.add_argument("--hold-duration", type=int, default=700, help="Hold duration at keyframes in ms")
    parser.add_argument("--trans-duration", type=int, default=100, help="Transition frame duration in ms")
    parser.add_argument("--sequence", default="", help="Comma-separated keyframe index order (default depends on layout)")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    sheet = Image.open(args.source).convert("RGB")
    W, H = sheet.width, sheet.height
    inset = args.gutter // 2

    boxes: list[tuple[int, int, int, int]] = []
    if args.layout == "2x2":
        half_w = W // 2
        half_h = H // 2
        boxes = [
            (0, 0, half_w - inset, half_h - inset),
            (half_w + inset, 0, W, half_h - inset),
            (0, half_h + inset, half_w - inset, H),
            (half_w + inset, half_h + inset, W, H),
        ]
        default_seq = "0,1,2,3"
    elif args.layout == "1x2":
        half_w = W // 2
        boxes = [
            (0, 0, half_w - inset, H),
            (half_w + inset, 0, W, H),
        ]
        default_seq = "0,1,0"
    elif args.layout == "2x1":
        half_h = H // 2
        boxes = [
            (0, 0, W, half_h - inset),
            (0, half_h + inset, W, H),
        ]
        default_seq = "0,1,0"
    elif args.layout == "1x3":
        third_w = W // 3
        boxes = [
            (0, 0, third_w - inset, H),
            (third_w + inset, 0, 2 * third_w - inset, H),
            (2 * third_w + inset, 0, W, H),
        ]
        default_seq = "0,1,2,1"
    elif args.layout == "1x4":
        quarter_w = W // 4
        boxes = [
            (0, 0, quarter_w - inset, H),
            (quarter_w + inset, 0, 2 * quarter_w - inset, H),
            (2 * quarter_w + inset, 0, 3 * quarter_w - inset, H),
            (3 * quarter_w + inset, 0, W, H),
        ]
        default_seq = "0,1,2,3"

    frames: list[Image.Image] = []
    for index, box in enumerate(boxes):
        frame = sheet.crop(box)
        if args.layout == "2x2" and index >= 2 and args.lower_row_lift:
            aligned = Image.new("RGB", frame.size, "#F5F1EA")
            aligned.paste(frame, (0, -args.lower_row_lift))
            frame = aligned
        frame.thumbnail((args.size, args.size), Image.Resampling.LANCZOS)
        canvas = Image.new("RGB", (args.size, args.size), "#F5F1EA")
        canvas.paste(frame, ((args.size - frame.width) // 2, (args.size - frame.height) // 2))
        frames.append(canvas)

    seq_str = args.sequence if args.sequence else default_seq
    sequence_indices = [int(x.strip()) for x in seq_str.split(",") if x.strip()]

    animated_frames: list[Image.Image] = []
    durations: list[int] = []

    for idx, k_idx in enumerate(sequence_indices):
        animated_frames.append(frames[k_idx])
        is_anchor = (idx == 0 or idx == len(sequence_indices) // 2)
        durations.append(args.hold_duration if is_anchor else int(args.hold_duration * 0.75))

        if args.blend_steps > 0:
            next_k_idx = sequence_indices[(idx + 1) % len(sequence_indices)]
            for step in range(1, args.blend_steps + 1):
                alpha = step / (args.blend_steps + 1)
                blended = Image.blend(frames[k_idx], frames[next_k_idx], alpha)
                animated_frames.append(blended)
                durations.append(args.trans_duration)

    args.output_dir.mkdir(parents=True, exist_ok=True)

    gif_frames = [frame.quantize(colors=128, method=Image.Quantize.MEDIANCUT) for frame in animated_frames]
    gif_frames[0].save(
        args.output_dir / f"{args.slug}.gif",
        save_all=True,
        append_images=gif_frames[1:],
        duration=durations,
        loop=0,
        disposal=2,
        optimize=True,
    )
    animated_frames[0].save(
        args.output_dir / f"{args.slug}.webp",
        save_all=True,
        append_images=animated_frames[1:],
        duration=durations,
        loop=0,
        quality=88,
        method=6,
    )
    animated_frames[0].save(
        args.output_dir / f"{args.slug}.jpg",
        quality=92,
        optimize=True,
    )


if __name__ == "__main__":
    main()
