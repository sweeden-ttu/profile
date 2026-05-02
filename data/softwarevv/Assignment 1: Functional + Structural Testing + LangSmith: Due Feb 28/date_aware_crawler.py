"""Multi-Source News Crawler - Extracts actual article dates.

Crawls news and extracts the actual publish date from each article.
"""

from __future__ import annotations

import asyncio
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

from playwright.async_api import async_playwright

_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
_LEGAL_LUMINARY = Path("/Volumes/RepoPart1/legal-luminary")
# Allowlist: project config or legal-luminary
_ALLOWLIST_CANDIDATES = [
    _PROJECT_ROOT / "config" / "allowlist.json",
    _LEGAL_LUMINARY / "demos" / "langsmith_langgraph_demo" / "allowlist.json",
]
ALLOWLIST_PATH = next((p for p in _ALLOWLIST_CANDIDATES if p.exists()), _ALLOWLIST_CANDIDATES[0])
OUTPUT_DIR = Path("/Volumes/RepoPart1/legal-luminary/_posts")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

RELEVANT_KEYWORDS = [
    "bell county",
    "killeen",
    "temple",
    "belton",
    "harker heights",
    "copperas cove",
    "texas",
    "court",
    "legal",
    "law",
    "crime",
    "police",
    "sheriff",
    "arrest",
    "accident",
    "injury",
    "defense",
    "attorney",
    "judge",
    "legislature",
    "bill",
    "government",
]


def load_allowlist() -> Dict[str, Any]:
    if ALLOWLIST_PATH.exists():
        return json.loads(ALLOWLIST_PATH.read_text())
    return {"domains": []}


def is_relevant(text: str) -> bool:
    text_lower = text.lower()
    return any(kw in text_lower for kw in RELEVANT_KEYWORDS)


def extract_date(content: str, url: str) -> str:
    """Extract the actual publish date from article content."""
    # Common date patterns
    patterns = [
        r"([A-Za-z]+ \d{1,2},? \d{4})",  # February 11, 2026
        r"(\d{1,2}/[\d/]+)",  # 02/11/26 or 02/11/2026
        r"([A-Za-z]+ \d{1,2} \d{4})",  # February 11 2026
    ]

    for pattern in patterns:
        match = re.search(pattern, content[:500])
        if match:
            date_str = match.group(1)
            try:
                # Try to parse various formats
                for fmt in [
                    "%B %d, %Y",
                    "%B %d %Y",
                    "%m/%d/%y",
                    "%m/%d/%Y",
                    "%b %d, %Y",
                ]:
                    try:
                        parsed = datetime.strptime(
                            date_str.replace(",", ""), fmt.replace(",", "")
                        )
                        if 2020 <= parsed.year <= 2026:
                            return parsed.strftime("%Y-%m-%d")
                    except:
                        continue
            except:
                pass

    # Check URL for date pattern
    url_match = re.search(r"/(\d{4})/(\d{2})/(\d{2})/", url)
    if url_match:
        year, month, day = url_match.groups()
        if 2020 <= int(year) <= 2026:
            return f"{year}-{month}-{day}"

    return "2026-02-19"  # Default


async def crawl_source(name: str, url: str, browser, allowed: List[str]) -> List[Dict]:
    results = []
    seen = set()

    try:
        page = await browser.new_page()
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        await page.wait_for_timeout(3000)

        links = await page.evaluate("""() => {
            return Array.from(document.querySelectorAll('a'))
                .map(a => ({href: a.href, text: a.innerText}))
                .filter(a => a.text.length > 15 && a.href && a.href.includes('/news/'))
                .slice(0, 20);
        }""")

        print(f"{name}: Found {len(links)} news links")

        for link in links:
            href = link.get("href", "")
            if not href or href in seen:
                continue
            if not any(d in href for d in allowed):
                continue

            seen.add(href)

            try:
                await page.goto(href, wait_until="domcontentloaded", timeout=20000)

                title = await page.title()
                content = await page.evaluate(
                    "document.body ? document.body.innerText.substring(0, 3000) : ''"
                )

                # Extract actual date from article
                article_date = extract_date(content, href)

                if is_relevant(title + content) and len(content) > 300:
                    results.append(
                        {
                            "title": title,
                            "content": content,
                            "url": href,
                            "source": name,
                            "date": article_date,
                        }
                    )
                    print(f"  + {title[:40]}... ({article_date})")

            except Exception as e:
                pass

        await page.close()

    except Exception as e:
        print(f"Error on {name}: {e}")

    return results


async def main():
    print("Starting Multi-Source News Crawler with Date Extraction...")
    print("=" * 50)

    allowlist = load_allowlist()
    allowed = [d.lower().replace("www.", "") for d in allowlist.get("domains", [])]

    SOURCES = [
        ("KWTX", "https://www.kwtx.com/news/"),
        ("KBTX", "https://www.kbtx.com/news/"),
        ("KXAN", "https://www.kxan.com/news/"),
        ("KVUE", "https://www.kvue.com/news/"),
    ]

    all_articles = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(channel="chrome", headless=True)

        for name, url in SOURCES:
            print(f"\n=== {name} ===")
            articles = await crawl_source(name, url, browser, allowed)
            all_articles.extend(articles)

        await browser.close()

    print(f"\n=== Found {len(all_articles)} relevant articles ===")

    seen_titles = {}
    count = 0

    for article in all_articles:
        title = article.get("title", "")[:30]
        date = article.get("date", "2026-02-19")

        key = (title, date)
        if key in seen_titles:
            continue
        seen_titles[key] = True

        slug = re.sub(r"[^a-z0-9]+", "-", title.lower())[:40].strip("-")

        # Check if already exists - use full filename with date
        filename = f"{date}-{slug}.md"
        if (OUTPUT_DIR / filename).exists():
            continue

        post = f"""---
title: "{article.get("title", "Untitled")}"
date: {date}
layout: default
source_url: "{article.get("url", "")}"
source_name: "{article.get("source", "News")}"
verified_at: {date}
category: news
news_excerpt: true
---

{article.get("content", "")[:1500]}

## Source Information

- **Source**: {article.get("source", "News")}
- **Original URL**: {article.get("url", "")}
- **Published**: {date}
- **Verified**: {date}

---
"""

        (OUTPUT_DIR / f"{date}-{slug}.md").write_text(post)
        print(f"  Saved: {date}-{slug}.md")
        count += 1

    print(f"\nDone! Created {count} new posts.")


if __name__ == "__main__":
    asyncio.run(main())
