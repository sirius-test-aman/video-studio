"""
Replace an Incognito/Dev browser chrome with a normal light Chrome chrome
showing the prod URL, drawn from primitives (no external asset dependency,
matching the pattern used for the cursor icon and click hand elsewhere in
this pipeline).

Usage:
    python3 rebrand.py <input.png> <output.png> <url_text> [--tab "Velox"]
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

def find_chrome_height(im, sample_step=40, jump=40):
    px = im.load()
    w, h = im.size
    prev = None
    for y in range(min(h, 200)):
        row = [px[x, y] for x in range(0, w, sample_step)]
        luma = sum(sum(p) / 3 for p in row) / len(row)
        if prev is not None and luma - prev > jump and luma > 180:
            return y
        prev = luma
    return None

def font(size, bold=False):
    # Chrome's own UI font is Segoe UI on Windows; DejaVu is the Linux
    # fallback. Both carry the ‹ › ↻ × glyphs this chrome draws.
    win = os.environ.get("WINDIR", r"C:\Windows")
    if bold:
        paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            os.path.join(win, "Fonts", "segoeuib.ttf"),
            os.path.join(win, "Fonts", "arialbd.ttf"),
        ]
    else:
        paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            os.path.join(win, "Fonts", "segoeui.ttf"),
            os.path.join(win, "Fonts", "arial.ttf"),
        ]
    for path in paths:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            pass
    return ImageFont.load_default()

def draw_chrome(width, height, url_text, tab_text="Velox"):
    img = Image.new("RGB", (width, height), "#FFFFFF")
    d = ImageDraw.Draw(img)
    s = width / 1920  # scale factor if a source isn't exactly 1920 wide

    tab_h = int(height * 0.40)
    tool_h = height - tab_h

    # tab strip
    d.rectangle([0, 0, width, tab_h], fill="#DEE1E6")
    tab_w = int(240 * s)
    d.polygon(
        [(int(14*s), tab_h), (int(28*s), int(8*s)), (tab_w-int(28*s), int(8*s)), (tab_w, tab_h)],
        fill="#FFFFFF",
    )
    fav_r = int(7*s)
    fav_cx, fav_cy = int(40*s), tab_h - int(tab_h*0.55)
    d.ellipse([fav_cx-fav_r, fav_cy-fav_r, fav_cx+fav_r, fav_cy+fav_r], fill="#C8102E")
    d.text((int(58*s), fav_cy-int(9*s)), tab_text, font=font(int(13*s)), fill="#1F1F1F")
    d.text((tab_w-int(20*s), fav_cy-int(8*s)), "×", font=font(int(15*s)), fill="#5F6368")

    # toolbar
    ty0 = tab_h
    d.rectangle([0, ty0, width, height], fill="#FFFFFF")
    cy = ty0 + tool_h // 2
    # back / forward / reload glyphs
    for i, ch in enumerate(["‹", "›", "↻"]):
        x = int(24*s) + i * int(34*s)
        d.text((x, cy - int(11*s)), ch, font=font(int(20*s)), fill="#5F6368" if i < 2 else "#3C4043")
    # address pill
    ax0 = int(150*s)
    ax1 = width - int(230*s)
    pill_h = int(tool_h * 0.62)
    ay0 = cy - pill_h // 2
    ay1 = cy + pill_h // 2
    d.rounded_rectangle([ax0, ay0, ax1, ay1], radius=pill_h // 2, fill="#F1F3F4")
    # padlock
    lx = ax0 + int(16*s)
    d.rounded_rectangle([lx, cy-int(5*s), lx+int(11*s), cy+int(6*s)], radius=2, outline="#5F6368", width=1)
    d.arc([lx+int(1*s), cy-int(11*s), lx+int(10*s), cy-int(2*s)], 180, 360, fill="#5F6368", width=1)
    d.text((lx+int(20*s), cy-int(9*s)), url_text, font=font(int(15*s)), fill="#1F1F1F")
    # profile circle, right edge
    pr = int(13*s)
    pcx, pcy = width - int(40*s), cy
    d.ellipse([pcx-pr, pcy-pr, pcx+pr, pcy+pr], fill="#C8102E")
    d.text((pcx-int(5*s), pcy-int(9*s)), "T", font=font(int(13*s), bold=True), fill="#FFFFFF")

    return img

def rebrand(src_path, out_path, url_text, tab_text="Velox", chrome_height=None):
    im = Image.open(src_path).convert("RGB")
    w, h = im.size
    chrome_h = chrome_height if chrome_height is not None else find_chrome_height(im)
    if chrome_h is None:
        raise RuntimeError(
            f"{src_path}: could not detect the chrome boundary automatically "
            f"(likely an overlay or dropdown is open, darkening the top of the "
            f"page). Fix: run this on a plain frame from the same capture "
            f"session first, note the height it reports, then re-run this one "
            f"with --chrome-height <that number>."
        )
    chrome = draw_chrome(w, chrome_h, url_text, tab_text)
    out = im.copy()
    out.paste(chrome, (0, 0))
    out.save(out_path)
    return chrome_h

def _flag(name, default=None, cast=str):
    if name in sys.argv:
        return cast(sys.argv[sys.argv.index(name) + 1])
    return default

if __name__ == "__main__":
    if len(sys.argv) < 4 or sys.argv[1] in ("-h", "--help"):
        print(__doc__)
        print(
            "\nOptions:\n"
            "  --tab TEXT              tab title, default Velox\n"
            "  --chrome-height N       skip auto-detect, use this pixel height\n"
            "                          (find it once per capture session on a\n"
            "                          plain frame, reuse it for the rest)\n"
        )
        sys.exit(0 if len(sys.argv) > 1 else 1)

    src, out, url = sys.argv[1], sys.argv[2], sys.argv[3]
    tab = _flag("--tab", "Velox")
    chrome_height = _flag("--chrome-height", None, int)
    try:
        h = rebrand(src, out, url, tab, chrome_height)
        print(f"OK  chrome height {h}px  ->  {out}")
    except RuntimeError as e:
        print(f"FAIL  {e}")
        sys.exit(1)
