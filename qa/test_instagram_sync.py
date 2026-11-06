import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("instagram_sync", Path("scripts/update_instagram_feed.py"))
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)


class InstagramSyncTests(unittest.TestCase):
    def test_instagram_urls_only(self):
        self.assertTrue(sync.instagram_post_url("https://www.instagram.com/reel/DfW-NHczYrd/"))
        self.assertTrue(sync.instagram_post_url("https://www.instagram.com/p/Example123/"))
        self.assertFalse(sync.instagram_post_url("https://instagram.com/reel/Example123/"))
        self.assertFalse(sync.instagram_post_url("https://www.instagram.com.evil.test/reel/Example123/"))
        self.assertFalse(sync.instagram_post_url("http://www.instagram.com/p/Example123/"))

    def test_sort_by_time_and_preserve_approved_snippets(self):
        rows = [
            {"permalink": "https://www.instagram.com/p/TestOlder/", "timestamp": "2026-11-02T20:00:00+0000", "caption": "写真の投稿"},
            {"permalink": "https://www.instagram.com/reel/TestNewer/", "timestamp": "2026-11-05T20:00:00+0000", "caption": "あたらしいノン！"},
            {"permalink": "https://not-instagram.example/p/Bad/", "timestamp": "2026-11-06T10:00:00+0000"},
        ]
        old = {"items": [
            {"url": "https://www.instagram.com/reel/TestNewer/", "title": "確定したタイトル", "summary": "確定した紹介文"}
        ]}
        feed = sync.normalize_rows(rows, old)
        self.assertEqual(len(feed), 2)
        self.assertEqual(feed[0]["type"], "reel")
        self.assertEqual(feed[1]["type"], "post")
        self.assertEqual(feed[0]["title"], "確定したタイトル")
        self.assertEqual(feed[0]["summary"], "確定した紹介文")
        self.assertEqual(feed[0]["published_on"], "2026-11-06")  # JST: previous UTC day

    def test_empty_or_bad_time_does_not_create_fake_posts(self):
        self.assertEqual(sync.normalize_rows([
            {"permalink": "https://www.instagram.com/reel/TEST/", "timestamp": "garbage"}
        ], {"items": []}), [])


if __name__ == "__main__":
    unittest.main()
