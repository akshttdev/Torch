import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from requests.exceptions import RequestException, Timeout

BASE_URL = "https://pytorch.org/docs/stable/"
HEADERS = {"User-Agent": "TorchPlusBot/1.0"}

MAX_RETRIES = 3
RETRY_SLEEP = 2


def get_doc_links():
    html = requests.get(BASE_URL, headers=HEADERS, timeout=20).text
    soup = BeautifulSoup(html, "html.parser")

    links = set()

    for a in soup.select("a[href]"):
        href = a["href"]
        full = urljoin(BASE_URL, href)
        parsed = urlparse(full)

        if (
            parsed.netloc == "pytorch.org"
            and parsed.path.startswith("/docs/stable/")
            and parsed.path.endswith(".html")
        ):
            links.add(full.split("#")[0])

    return sorted(links)


def extract_page(url: str):
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = requests.get(
                url,
                headers=HEADERS,
                timeout=20,
            )
            response.raise_for_status()
            html = response.text
            break
        except (RequestException, Timeout):
            if attempt == MAX_RETRIES:
                print(f"[SKIP] Failed to fetch {url}")
                return None
            print(f"[RETRY] {url} (attempt {attempt})")
            time.sleep(RETRY_SLEEP)

    soup = BeautifulSoup(html, "html.parser")

    article = soup.find("article", class_="bd-article")
    if not article:
        return None

    # remove navigation / TOC
    for nav in article.select(".toctree-wrapper"):
        nav.decompose()

    h1 = article.find("h1")
    title = h1.get_text(strip=True) if h1 else "PyTorch Documentation"

    blocks = []
    for tag in article.find_all(["p", "li", "pre", "code", "table"]):
        text = tag.get_text(" ", strip=True)
        if text and len(text) > 20:
            blocks.append(text)

    if not blocks:
        return None

    return {
        "title": title,
        "url": url,
        "text": "\n".join(blocks),
    }