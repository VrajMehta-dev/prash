# Builds store screenshots: raw app screen in a phone frame on a fixed brand gradient, a headline with a highlighted
# phrase.
# Usage: python3 compose.py   (reads screenshots-raw/*.png, writes screenshots/play, appstore-6.9, appstore-6.5)
import os, glob
from PIL import Image, ImageDraw, ImageFont, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__))
FONT = "/Users/dhruv/Documents/Projects/PRASH/PRASH/prash/android/app/src/main/assets/fonts/Inter-%s.ttf"
HI = (255, 196, 214)  # highlight colour (soft pink) on the dark gradient
# key: headline parts [(text, highlighted)]
COPY = {
 "01-login": ([("Sign in ", 0), ("your way", 1)]),
 "02-home": ([("Everything you owe, ", 0), ("at a glance", 1)]),
 "03-pay-in-order": ([("Pay ", 0), ("in the right order", 1)]),
 "04-checkout-review": ([("Review, then ", 0), ("slide to pay", 1)]),
 "05-rent": ([("Monthly rent, ", 0), ("always clear", 1)]),
 "06-extras": ([("Extra charges, ", 0), ("itemised", 1)]),
 "07-container-charges": ([("Container charges, ", 0), ("simplified", 1)]),
 "08-security-deposit": ([("Security deposit ", 0), ("with receipts", 1)]),
 "09-shop-documents": ([("Contracts and licences ", 0), ("in one place", 1)]),
 "10-notifications": ([("Never miss ", 0), ("a due date", 1)]),
 "11-account": ([("Your details, ", 0), ("always at hand", 1)]),
 "12-more-sheet": ([("Everything ", 0), ("one tap away", 1)]),
 "13-forgot-password": ([("Reset your password ", 0), ("in seconds", 1)]),
}
SIZES = {"play": (1080, 1920), "appstore-6.9": (1320, 2868), "appstore-6.5": (1284, 2778)}

def background(W, H):
    # fixed gradient: near-black plum at the top, brand maroon in the middle, brighter rose at the bottom
    stops = [(0.0, (22, 6, 16)), (0.38, (74, 16, 42)), (0.72, (114, 28, 63)), (1.0, (176, 52, 104))]
    col = Image.new("RGB", (1, H))
    for y in range(H):
        t = y / (H - 1)
        for (a, ca), (b, cb) in zip(stops, stops[1:]):
            if a <= t <= b:
                u = (t - a) / (b - a)
                col.putpixel((0, y), tuple(int(ca[i] + (cb[i] - ca[i]) * u) for i in range(3)))
                break
    return col.resize((W, H))

def draw_headline(d, parts, W, y, font):
    words = [(w, h) for text, h in parts for w in text.split()]
    space = d.textlength(" ", font=font)
    width = lambda ln: sum(d.textlength(w, font=font) for w, _ in ln) + space * (len(ln) - 1)
    limit = W * 0.86
    lines = [words]
    if width(words) > limit:  # 2 lines, split where the longer line is shortest (balanced)
        best = min(range(1, len(words)), key=lambda i: max(width(words[:i]), width(words[i:])))
        lines = [words[:best], words[best:]]
        if max(width(l) for l in lines) > limit:  # 3 lines
            best3 = min(((i, j) for i in range(1, len(words)) for j in range(i + 1, len(words))),
                        key=lambda ij: max(width(words[:ij[0]]), width(words[ij[0]:ij[1]]), width(words[ij[1]:])))
            lines = [words[:best3[0]], words[best3[0]:best3[1]], words[best3[1]:]]
    lead = int(font.size * 1.22)
    for ln in lines:
        x = (W - width(ln)) / 2
        for w, h in ln:
            d.text((x, y), w, font=font, fill=HI if h else "white")
            x += d.textlength(w, font=font) + space
        y += lead
    return y

def phone_img(raw, pw, bz, r):
    ph = int(pw * raw.height / raw.width)
    img = Image.new("RGBA", (pw + 2 * bz, ph + 2 * bz), (0, 0, 0, 0))
    ImageDraw.Draw(img).rounded_rectangle((0, 0, img.width - 1, img.height - 1), r + bz, fill=(12, 8, 14, 255))
    mask = Image.new("L", (pw, ph), 0); ImageDraw.Draw(mask).rounded_rectangle((0, 0, pw - 1, ph - 1), r, fill=255)
    img.paste(raw.convert("RGB").resize((pw, ph), Image.LANCZOS), (bz, bz), mask)
    return img

def shadow(size, box, radius, alpha=90, blur=28, dy=18):
    sh = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle((box[0], box[1] + dy, box[2], box[3] + dy), radius, fill=(0, 0, 0, alpha))
    return sh.filter(ImageFilter.GaussianBlur(blur))

def compose(raw, parts, W, H):
    img = background(W, H).convert("RGBA"); d = ImageDraw.Draw(img)
    font = ImageFont.truetype(FONT % "SemiBold", int(W * 0.074))
    y0 = int(H * 0.06)
    y = draw_headline(d, parts, W, y0, font)
    top = max(y + int(W * 0.06), int(H * 0.215))
    pw = int(W * 0.78); bz = int(W * 0.012); r = int(W * 0.07)
    phone = phone_img(raw, pw, bz, r); px = (W - phone.width) // 2
    img = Image.alpha_composite(img, shadow(img.size, (px, top, px + phone.width, top + phone.height), r + bz))
    img.alpha_composite(phone, (px, top))
    return img.convert("RGB")

if __name__ == "__main__":
    for path in sorted(glob.glob(os.path.join(HERE, "screenshots-raw", "*.png"))):
        key = os.path.basename(path)[:-4]
        if key not in COPY: continue
        raw = Image.open(path)
        for folder, (W, H) in SIZES.items():
            out = os.path.join(HERE, "screenshots", folder); os.makedirs(out, exist_ok=True)
            compose(raw, COPY[key], W, H).save(os.path.join(out, key + ".png"))
        print("composed", key)
