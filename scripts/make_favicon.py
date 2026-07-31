#!/usr/bin/env python3
"""Генерация favicon/apple-touch-icon сайта из public/logo-icon.png (альфа-маска
глифа «C»), залитого фирменным градиентом (тот же, что в CSS-масках логотипа
и во Flutter-приложении — см. lib/widgets/brand_gradient.dart).

Пересборка: python3 scripts/make_favicon.py
"""
import os
from PIL import Image

PUBLIC = os.path.join(os.path.dirname(__file__), "..", "public")
TOP = (0x40, 0xD0, 0xE4)
BOTTOM = (0x00, 0x82, 0x9C)


def gradient_fill(size: int) -> Image.Image:
    grad = Image.new("RGB", (1, size))
    for y in range(size):
        t = y / (size - 1)
        grad.putpixel((0, y), tuple(int(TOP[i] + (BOTTOM[i] - TOP[i]) * t) for i in range(3)))
    return grad.resize((size, size))


glyph = Image.open(f"{PUBLIC}/logo-icon.png").convert("RGBA")
alpha = glyph.getchannel("A")

S = 512
canvas = gradient_fill(S).resize(glyph.size).convert("RGBA")
canvas.putalpha(alpha)
canvas = canvas.resize((S, S), Image.LANCZOS)
canvas.save(f"{PUBLIC}/favicon-icon.png")
canvas.save(f"{PUBLIC}/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
print("Wrote public/favicon-icon.png and public/favicon.ico")
