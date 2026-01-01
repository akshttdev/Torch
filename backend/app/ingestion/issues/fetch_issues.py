import os
from github import Github
from dotenv import load_dotenv

load_dotenv()

REPO = "pytorch/pytorch"

def fetch_issues(limit=500):
    token = os.getenv("GITHUB_TOKEN")
    gh = Github(token)
    repo = gh.get_repo(REPO)

    issues = []
    for issue in repo.get_issues(state="all")[:limit]:
        issues.append({
            "number": issue.number,
            "title": issue.title or "",
            "body": issue.body or "",
            "comments": [c.body for c in issue.get_comments()],
            "url": issue.html_url,
            "labels": [l.name for l in issue.labels],
        })

    return issues