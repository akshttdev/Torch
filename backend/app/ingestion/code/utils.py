def build_code_content(chunk: dict) -> str:
    parts = []

    if chunk.get("symbol"):
        parts.append(f"Symbol: {chunk['symbol']}")

    if chunk.get("docstring"):
        parts.append(f"Docstring:\n{chunk['docstring']}")

    if chunk.get("content"):
        parts.append("Code:\n" + chunk["content"][:2000])  # cap length

    if chunk.get("file_path"):
        parts.append(f"File: {chunk['file_path']}")

    return "\n\n".join(parts)