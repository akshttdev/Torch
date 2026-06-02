import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from requests.exceptions import RequestException, Timeout

BASE_URL = "https://pytorch.org/docs/stable/"
HEADERS = {"User-Agent": "TorchPlusBot/1.0"}

MAX_RETRIES = 3
RETRY_SLEEP = 2


def _resolve_stable_root() -> str:
    """`/docs/stable/` is a thin redirect stub; follow it to the real
    versioned docs root, e.g. `https://pytorch.org/docs/2.12/`."""
    html = requests.get(BASE_URL, headers=HEADERS, timeout=20).text
    soup = BeautifulSoup(html, "html.parser")
    for a in soup.select("a[href]"):
        full = urljoin(BASE_URL, a["href"])
        parsed = urlparse(full)
        if (
            parsed.netloc == "pytorch.org"
            and parsed.path.startswith("/docs/")
            and parsed.path.endswith("/index.html")
            and "/stable/" not in parsed.path
        ):
            return full.rsplit("/", 1)[0] + "/"
    return BASE_URL


def _collect_links(page_url: str, base_path: str) -> set[str]:
    try:
        html = requests.get(page_url, headers=HEADERS, timeout=20).text
    except (RequestException, Timeout):
        return set()
    soup = BeautifulSoup(html, "html.parser")
    out: set[str] = set()
    for a in soup.select("a[href]"):
        full = urljoin(page_url, a["href"]).split("#")[0]
        parsed = urlparse(full)
        if (
            parsed.netloc == "pytorch.org"
            and parsed.path.startswith(base_path)
            and parsed.path.endswith(".html")
        ):
            out.add(full)
    return out


def get_doc_links() -> list[str]:
    """Return every doc URL we can reach from the stable docs root.
    Uses genindex (flat A–Z API list) + main index toctree as seed pages —
    together they cover ~all public pages without recursive crawling."""
    root = _resolve_stable_root()
    base_path = urlparse(root).path  # e.g. "/docs/2.12/"
    links: set[str] = set()
    for seed in ("genindex.html", "index.html", "py-modindex.html"):
        links |= _collect_links(root + seed, base_path)
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