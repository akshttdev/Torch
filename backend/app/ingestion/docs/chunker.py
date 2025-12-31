def chunk_docs(text: str, max_chars: int = 2500, overlap: int = 300):
    chunks = []
    start = 0

    while start < len(text):
        end = start + max_chars
        chunk = text[start:end].strip()

        if len(chunk) > 200:
            chunks.append(chunk)

        start += max_chars - overlap

    return chunks