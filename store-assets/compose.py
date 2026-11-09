# Builds store screenshots: raw app screen inside a phone frame on the brand gradient, with a headline.
# Usage: python3 compose.py   (reads screenshots-raw/*.png, writes screenshots/play, appstore-6.9, appstore-6.5)
import os, glob
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
FONT = "/Users/dhruv/Documents/Projects/PRASH/PRASH/prash/android/app/src/main/assets/fonts/Inter-%s.ttf"
# Per slide: headline, background, text colour, accent, layout. Style: loud uppercase headline on a flat colour,
# phone with a thin bezel, bleeding off the bottom; some slides zoom in, some add a floating callout crop.
PLUM, ROSE, CREAM, INK = (0x4a, 0x10, 0x2a), (0xf3, 0xc9, 0xd8), (0xfb, 0xf3, 0xe8), (0x1d, 0x10, 0x18)
MAROON, GOLD, MINT = (0x72, 0x1c, 0x3f), (0xf6, 0xc3, 0x4a), (0xb9, 0xe8, 0xcf)
COPY = {
 "01-login": ("SIGN IN YOUR WAY", MAROON, "white", GOLD, "full", None),
 "02-home": ("EVERYTHING YOU OWE, AT A GLANCE", CREAM, INK, MAROON, "zoom", None),
 "03-pay-in-order": ("PAY IN THE RIGHT ORDER", PLUM, "white", GOLD, "full", None),
 "04-checkout-review": ("REVIEW. THEN SLIDE TO PAY.", ROSE, INK, MAROON, "full", None),
 "05-rent": ("MONTHLY RENT, ALWAYS CLEAR", MAROON, "white", GOLD, "zoom", None),
 "06-extras": ("EXTRA CHARGES, ITEMISED", MINT, INK, MAROON, "full", None),
 "07-container-charges": ("CONTAINER CHARGES, SIMPLIFIED", CREAM, INK, MAROON, "full", None),
 "08-security-deposit": ("SECURITY DEPOSIT WITH RECEIPTS", PLUM, "white", GOLD, "zoom", None),
 "09-shop-documents": ("CONTRACTS AND LICENCES, ONE PLACE", ROSE, INK, MAROON, "full", None),
 "10-notifications": ("NOTIFICATIONS THAT OPEN THE RIGHT PAGE", MAROON, "white", GOLD, "full", None),
 "11-account": ("YOU STAY IN CONTROL", CREAM, INK, MAROON, "zoom", None),
 "12-more-sheet": ("EVERYTHING ONE TAP AWAY", MINT, INK, MAROON, "full", None),
 "13-forgot-password": ("RESET YOUR PASSWORD IN SECONDS", ROSE, INK, MAROON, "full", None),
}
SIZES = {"play": (1080, 1920), "appstore-6.9": (1320, 2868), "appstore-6.5": (1284, 2778)}

def wrap(d, text, font, maxw):
    lines, cur = [], ""
    for wd in text.split():
        t = (cur + " " + wd).strip()
        if d.textlength(t, font=font) <= maxw: cur = t
        else: lines.append(cur); cur = wd
    return lines + [cur]

def phone_img(raw, pw, bz, r):
    ph = int(pw * raw.height / raw.width)
    ph_img = Image.new("RGBA", (pw + 2 * bz, ph + 2 * bz), (0, 0, 0, 0))
    ImageDraw.Draw(ph_img).rounded_rectangle((0, 0, ph_img.width - 1, ph_img.height - 1), r + bz, fill=(14, 10, 16, 255))
    mask = Image.new("L", (pw, ph), 0); ImageDraw.Draw(mask).rounded_rectangle((0, 0, pw - 1, ph - 1), r, fill=255)
    ph_img.paste(raw.convert("RGB").resize((pw, ph), Image.LANCZOS), (bz, bz), mask)
    return ph_img

def compose(raw, head, bg, fg, accent, layout, W, H):
    img = Image.new("RGB", (W, H), bg); d = ImageDraw.Draw(img)
    hf = ImageFont.truetype(FONT % "Bold", int(W * 0.108))
    lines = wrap(d, head, hf, W * 0.88); lead = int(W * 0.112)
    block_top = int(H * 0.04); block_h = 3 * lead          # same phone position on every slide
    y = block_top + (block_h - len(lines) * lead) // 2
    for ln in lines:
        d.text((W / 2, y), ln, font=hf, fill=fg, anchor="ma"); y += lead
    bar_y = block_top + block_h + int(W * 0.028)
    d.rounded_rectangle((W / 2 - W * 0.06, bar_y, W / 2 + W * 0.06, bar_y + W * 0.014), W * 0.007, fill=accent)
    top = bar_y + int(W * 0.06)
    pw = int(W * (0.86 if layout == "zoom" else 0.72)); bz = int(W * 0.012); r = int(W * 0.075)
    phone = phone_img(raw, pw, bz, r)
    img = img.convert("RGBA")
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    px = (W - phone.width) // 2
    ImageDraw.Draw(sh).rounded_rectangle((px, top + 30, px + phone.width, top + phone.height + 30), r + bz, fill=(0, 0, 0, 60))
    img = Image.alpha_composite(img, sh); img.alpha_composite(phone, (px, top))
    return img.convert("RGB")

if __name__ == "__main__":
    for path in sorted(glob.glob(os.path.join(HERE, "screenshots-raw", "*.png"))):
        key = os.path.basename(path)[:-4]
        if key not in COPY: continue
        raw = Image.open(path); head, bg, fg, accent, layout, _ = COPY[key]
        for folder, (W, H) in SIZES.items():
            out = os.path.join(HERE, "screenshots", folder); os.makedirs(out, exist_ok=True)
            compose(raw, head, bg, fg, accent, layout, W, H).save(os.path.join(out, key + ".png"))
        print("composed", key)
