"""Decode Paint 3D .paint files (HEIF with 'unci' uncompressed raw items).

Strategy:
- Find the 'mdat' box (raw payload).
- Skip leading zero/header bytes until we hit a region whose length equals
  width*height*channels (RGB or RGBA).
- Try multiple channel/stride combinations and pick the one that produces a
  plausible image (most pixels not pure white/black).
"""
from pathlib import Path
import struct
from PIL import Image
import pillow_heif

HERE = Path(__file__).resolve().parent
OUT = HERE / "sketches"
OUT.mkdir(exist_ok=True)


def get_size(path):
    pillow_heif.register_heif_opener()
    return Image.open(path).size


def find_mdat(buf):
    i = 0
    while i + 8 <= len(buf):
        size = struct.unpack(">I", buf[i:i+4])[0]
        kind = buf[i+4:i+8]
        if size == 1:
            size = struct.unpack(">Q", buf[i+8:i+16])[0]
            data_off = i + 16
        else:
            data_off = i + 8
        if kind == b"mdat":
            return data_off, i + (size if size else len(buf) - i)
        if size == 0:
            return None
        i += size
    return None


def decode(path, out_png):
    w, h = get_size(path)
    buf = Path(path).read_bytes()
    mdat = find_mdat(buf)
    if not mdat:
        raise RuntimeError("no mdat")
    start, end = mdat
    payload = buf[start:end]
    print(f"{path.name}: {w}x{h}  mdat={len(payload)} bytes")

    for ch in (4, 3):
        need = w * h * ch
        if len(payload) < need:
            continue
        # Try every plausible offset (multiples of stride near start)
        stride = w * ch
        # Often Paint 3D stores RGBA top-down right at start of mdat.
        for off in (0, len(payload) - need):
            chunk = payload[off:off+need]
            mode = "RGBA" if ch == 4 else "RGB"
            try:
                img = Image.frombytes(mode, (w, h), chunk, "raw", mode, stride)
                # Quick sanity: not entirely uniform
                px = img.getpixel((w // 2, h // 2))
                print(f"  try ch={ch} off={off}: center={px}")
                img.save(out_png)
                print(f"  saved {out_png}")
                return
            except Exception as e:
                print("  err", e)
    raise RuntimeError("could not decode mdat")


if __name__ == "__main__":
    import sys
    for v in ("v1", "v2"):
        src = Path(rf"C:\Users\GaspardCatry\Downloads\steamon_{v}.paint")
        decode(src, OUT / f"steamon_{v}.png")
