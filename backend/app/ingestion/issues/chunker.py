def chunk_issue(issue: dict):
    chunks = []

    if issue["title"] or issue["body"]:
        chunks.append(f"{issue['title']}\n\n{issue['body']}")

    for i, c in enumerate(issue["comments"]):
        if c.strip():
            chunks.append(f"Comment {i+1}: {c}")

    return chunks