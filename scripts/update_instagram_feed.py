#!/usr/bin/env python3
"""Refresh the public Instagram post snapshot from the account owner's official API.

Requires a private GitHub Actions secret INSTAGRAM_ACCESS_TOKEN with
instagram_business_basic access. Never write tokens or expiring media URLs
into the public repository. Public data: stable post permalink, date, caption excerpt.
"""
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

FEED = Path("preview/instagram-recent.json")
ACCOUNT = "stuffed_saurus"
ENDPOINT = "https://graph.instagram.com/v26.0"


def get_json(path, query, token):
    url = ENDPOINT + path + "?" + urllib.parse.urlencode(query)
    req = urllib.request.Request(
        url, headers={"Authorization": "Bearer " + token, "Accept": "application/json"}
    )
    # Do not log URLs or raw API errors (they might contain sensitive credentials).
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.load(response)


def instagram_post_url(value):
    if not isinstance(value, str):
        return False
    parts = urllib.parse.urlparse(value)
    return (parts.scheme == "https" and parts.netloc == "www.instagram.com"
            and re.fullmatch(r"/(?:reel|p)/[A-Za-z0-9_-]+/?", parts.path) is not None)


def title_from_caption(caption):
    clean = re.sub(r"\s+", " ", (caption or "").split("#", 1)[0]).strip()
    return clean[:54].rstrip() if clean else "ティラノンの新しい投稿"


def normalize_rows(rows, old):
    previous = {p["url"]: p for p in old.get("items", []) if isinstance(p, dict) and p.get("url")}
    found = []
    for row in rows:
        url = row.get("permalink")
        if not instagram_post_url(url):
            continue
        try:
            stamp = datetime.fromisoformat(row["timestamp"].replace("Z", "+00:00"))
            if stamp.tzinfo is None:
                stamp = stamp.replace(tzinfo=timezone.utc)
        except (KeyError, TypeError, ValueError):
            continue
        old_row = previous.get(url, {})
        title = old_row.get("title") or title_from_caption(row.get("caption"))
        excerpt = old_row.get("summary")
        if not excerpt:
            content = re.sub(r"\s+", " ", (row.get("caption") or "").split("#", 1)[0]).strip()
            excerpt = content[:120].rstrip()
        new_post = {
            "published_on": stamp.astimezone(ZoneInfo('Asia/Tokyo')).date().isoformat(),
            "type": "reel" if "/reel/" in url else "post",
            "title": title, "summary": excerpt, "url": url,
        }
        # Preserve an existing *verified* permanent thumbnail for this exact post;
        # never display a thumbnail from a different Reel after an API refresh.
        code = url.rstrip("/").split("/")[-1]
        expected = "instagram-covers/" + code + ".webp"
        if old_row.get("cover_path") == expected and (FEED.parent / expected).is_file():
            new_post["cover_path"] = expected
            new_post["cover_source"] = old_row.get("cover_source", "connected @stuffed_saurus Reel thumbnail")
        found.append((stamp, new_post))
    found.sort(key=lambda item: item[0], reverse=True)
    return [row for _, row in found[:3]]


def main():
    token = os.environ.get("INSTAGRAM_ACCESS_TOKEN", "").strip()
    if not token:
        print("Instagram authorization not configured; keeping the verified snapshot.")
        return 0
    try:
        profile = get_json("/me", {"fields": "username"}, token)
        if profile.get("username", "").lower() != ACCOUNT:
            print("Instagram account mismatch: no changes made.", file=sys.stderr)
            return 1
        data = get_json("/me/media", {
            "fields": "id,caption,media_type,permalink,timestamp",
            "limit": "25",
        }, token)
        if not isinstance(data.get("data"), list):
            raise ValueError("unexpected media response")
        old = json.loads(FEED.read_text(encoding="utf-8"))
        updates = normalize_rows(data["data"], old)
        if not updates:
            print("No eligible public posts were returned; keeping existing snapshot.")
            return 0
        if old.get("items") == updates and old.get("auto_updated"):
            print("Instagram post selection unchanged; no commit needed.")
            return 0
        payload = {
            "account": ACCOUNT,
            "checked_at": datetime.now(ZoneInfo("Asia/Tokyo")).date().isoformat(),
            "source": "Instagram API with Instagram Login",
            "auto_updated": True,
            "items": updates,
        }
        FEED.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("Updated Instagram snapshot with", len(updates), "recent posts.")
        return 0
    except Exception:
        print("Instagram update failed; keeping the previous verified snapshot.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
