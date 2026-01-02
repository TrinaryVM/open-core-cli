#!/usr/bin/env python3
"""make_triforce.py – generate a three-frame animated Triforce demo.

Outputs:
  triforce.tritvm  – raw byte-code (Const4+PushOut per pixel)

Each frame: 81×27 = 2187 pixels
Frame order: solid, outline, inverted
"""
BASE_VAL_SOLID = 80   # bright glyph
BASE_VAL_EMPTY = 0    # dark glyph
W, H = 81, 27
SIZE = 12  # height of small triangle

# micro-ISA byte patterns
PUSHOUT = [0x60, 0]    # pushout R0
CONST = lambda val: [0x70, val % 81]  # const4 R0,val (translator hard-codes reg 0)

def inside_tri(row, col):
    cx, cy = W//2, 3
    # top
    if cy <= row <= cy+SIZE-1:
        span = row-cy
        return cx-span <= col <= cx+span
    # bottom left
    blx, bly = cx-SIZE, cy+SIZE
    if bly <= row <= bly+SIZE-1:
        span = row-bly
        return blx-span <= col <= blx+span
    # bottom right
    brx, bry = cx+SIZE, cy+SIZE
    if bry <= row <= bry+SIZE-1:
        span = row-bry
        return brx-span <= col <= brx+span
    return False

frames = []
for mode in ("solid", "outline", "invert"):
    bc = []
    for r in range(H):
        for c in range(W):
            bright = inside_tri(r, c)
            if mode == "outline":
                if bright and inside_tri(r-1,c) and inside_tri(r+1,c) and inside_tri(r,c-1) and inside_tri(r,c+1):
                    bright = False
            if mode == "invert":
                bright = not bright
            val = BASE_VAL_SOLID if bright else BASE_VAL_EMPTY
            bc += CONST(val) + PUSHOUT
    frames.append(bc)

with open("triforce.tritvm", "wb") as f:
    for fr in frames:
        f.write(bytes(fr))
print("triforce.tritvm written (", len(frames), "frames )") 