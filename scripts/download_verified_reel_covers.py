#!/usr/bin/env python3
"""One-time capture of the actual covers of verified owned Instagram Reels.

Images come from the connected @stuffed_saurus analytics source.
Signed Instagram CDN URLs are ephemeral and are never used by the public site.
The action copies these verified images to versioned, first-party WebP files.
No synthetic or unrelated artwork is substituted for a Reel cover.
"""
from io import BytesIO
import json
from pathlib import Path
import re
import urllib.parse
import urllib.request

from PIL import Image, ImageOps, UnidentifiedImageError

ROOT = Path("preview")
SEED = ROOT / "instagram-cover-sources.json"
FEED = ROOT / "instagram-recent.json"
OUTPUT = ROOT / "instagram-covers"
ALLOWED_HOSTS = ("cdninstagram.com", "fbcdn.net")
MAX_BYTES = 8 * 1024 * 1024


def shortcode(link):
    match = re.fullmatch(r"https://www\.instagram\.com/(?:reel|p)/([A-Za-z0-9_-]+)/?", link)
    if not match:
        raise ValueError("Unexpected Instagram permalink")
    return match.group(1)


def checked_cdn(url):
    parsed = urllib.parse.urlsplit(url)
    if parsed.scheme != "https" or not any(
        parsed.hostname == name or parsed.hostname.endswith("." + name)
        for name in ALLOWED_HOSTS
    ):
        raise ValueError("Unapproved Instagram media host")
    return url


def download_image(url):
    request = urllib.request.Request(
        checked_cdn(url),
        headers={
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17 Mobile/15 Safari/604.1",
            "Referer": "https://www.instagram.com/",
            "Accept": "image/avif,image/webp,image/jpeg,image/*;q=0.8",
        },
    )
    with urllib.request.urlopen(request, timeout=25) as response:
        data = response.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES or len(data) < 3000:
        raise ValueError("Media size outside expected limits")
    try:
        original = Image.open(BytesIO(data))
        original.verify()
        source = Image.open(BytesIO(data))
        source = ImageOps.exif_transpose(source)
        if source.width < 250 or source.height < 250:
            raise ValueError("Instagram cover image too small")
        source = source.convert("RGB")
        source.thumbnail((1080, 1920), Image.Resampling.LANCZOS)
        return source
    except UnidentifiedImageError as error:
        raise ValueError("Downloaded content was not an image") from error


def main():
    seed = json.loads(SEED.read_text(encoding="utf-8"))
    feed = json.loads(FEED.read_text(encoding="utf-8"))
    sources = {item["url"]: item["image_url"] for item in seed["items"]}
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for post in feed["items"]:
        link = post["url"]
        if link not in sources:
            raise ValueError("Missing verified Reel image URL")
        cover = download_image(sources[link])
        code = shortcode(link)
        image_path = OUTPUT / (code + ".webp")
        cover.save(image_path, format="WEBP", quality=89, method=6)
        post["cover_path"] = "instagram-covers/" + image_path.name
        post["cover_source"] = "connected @stuffed_saurus Reel thumbnail"
        print(f"Verified original Reel {code}: {cover.width}x{cover.height}, stored {image_path}, {image_path.stat().st_size} bytes")
    FEED.write_text(json.dumps(feed, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    SEED.unlink()
    print("Real Reel thumbnails captured; no expiring CDN URLs in the public data.")

if __name__ == "__main__":
    main()
