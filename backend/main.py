import os
import re
from typing import Optional

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv("backend/.env")
GITHUB_API = "https://api.github.com"
app = FastAPI(title="OpenSource AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("FRONTEND_ORIGIN", "http://localhost:5173").split(","),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)


def github_get(path: str, params: dict | None = None):
    headers = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    try:
        response = requests.get(f"{GITHUB_API}{path}", headers=headers, params=params, timeout=20)
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail="Could not connect to GitHub. Check your internet connection.") from exc
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Repository or resource not found. Check the owner and repository name.")
    if response.status_code == 403:
        raise HTTPException(status_code=429, detail="GitHub API rate limit or access restriction. Try again later or configure a backend GitHub token.")
    if not response.ok:
        raise HTTPException(status_code=response.status_code, detail="GitHub could not complete the request.")
    return response.json()


def validate_names(owner: str, repo: str):
    if not re.fullmatch(r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?", owner):
        raise HTTPException(status_code=400, detail="Invalid GitHub owner.")
    if not re.fullmatch(r"[A-Za-z0-9_.-]{1,100}", repo) or repo in {".", ".."}:
        raise HTTPException(status_code=400, detail="Invalid GitHub repository name.")


@app.get("/")
def root():
    return {"message": "OpenSource AI backend is running", "docs": "/docs"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}


@app.get("/api/repositories/{owner}/{repo}")
def repository(owner: str, repo: str):
    validate_names(owner, repo)
    data = github_get(f"/repos/{owner}/{repo}")
    return {
        "id": data.get("id"),
        "name": data.get("name"),
        "full_name": data.get("full_name"),
        "description": data.get("description"),
        "html_url": data.get("html_url"),
        "stargazers_count": data.get("stargazers_count", 0),
        "forks_count": data.get("forks_count", 0),
        "language": data.get("language"),
        "open_issues_count": data.get("open_issues_count", 0),
        "default_branch": data.get("default_branch", "main"),
        "owner": {"login": data.get("owner", {}).get("login", owner)},
        "name": data.get("name", repo),
    }


@app.get("/api/repositories/{owner}/{repo}/readme")
def readme(owner: str, repo: str):
    import base64
    validate_names(owner, repo)
    data = github_get(f"/repos/{owner}/{repo}/readme")
    try:
        content = base64.b64decode(data.get("content", "")).decode("utf-8", errors="replace")
    except Exception:
        content = ""
    return {"name": data.get("name", "README"), "content": content[:12000], "html_url": data.get("html_url")}


@app.get("/api/repositories/{owner}/{repo}/tree")
def tree(owner: str, repo: str):
    validate_names(owner, repo)
    metadata = github_get(f"/repos/{owner}/{repo}")
    branch = metadata.get("default_branch", "main")
    data = github_get(f"/repos/{owner}/{repo}/git/trees/{branch}", {"recursive": "1"})
    files = [{"path": item.get("path", ""), "type": "dir" if item.get("type") == "tree" else "file"} for item in data.get("tree", []) if item.get("type") in {"tree", "blob"}]
    return {"files": files[:250], "truncated": data.get("truncated", False)}


@app.get("/api/repositories/{owner}/{repo}/issues")
def issues(owner: str, repo: str, per_page: int = 30):
    validate_names(owner, repo)
    per_page = max(1, min(per_page, 100))
    data = github_get(f"/repos/{owner}/{repo}/issues", {"state": "open", "per_page": per_page, "sort": "created", "direction": "desc"})
    # GitHub's issues endpoint also returns pull requests; exclude them from issue lists.
    result = []
    for item in data:
        if "pull_request" in item:
            continue
        result.append({
            "id": item.get("id"), "number": item.get("number"), "title": item.get("title"),
            "body": (item.get("body") or "")[:5000], "html_url": item.get("html_url"),
            "created_at": item.get("created_at"), "user": {"login": item.get("user", {}).get("login", "unknown")},
            "labels": [{"id": x.get("id"), "name": x.get("name")} for x in item.get("labels", [])],
        })
    return {"issues": result}


class ExplainRequest(BaseModel):
    owner: str = Field(min_length=1, max_length=39)
    repo: str = Field(min_length=1, max_length=100)
    issue_number: Optional[int] = Field(default=None, ge=1)
    question: str = Field(default="Explain this repository issue to a beginner and give a safe, step-by-step contribution plan.", min_length=1, max_length=3000)


@app.post("/api/assistant/explain")
def explain(request: ExplainRequest):
    validate_names(request.owner, request.repo)
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    model = os.getenv("GROQ_MODEL", "").strip()
    if not api_key or not model:
        raise HTTPException(
            status_code=503,
            detail="AI is not configured yet. Copy backend/.env.example to backend/.env and set GROQ_API_KEY and GROQ_MODEL. Repository browsing works without an AI key."
        )
    repo_data = github_get(f"/repos/{request.owner}/{request.repo}")
    readme_text = ""
    try:
        readme_data = github_get(f"/repos/{request.owner}/{request.repo}/readme")
        import base64
        readme_text = base64.b64decode(readme_data.get("content", "")).decode("utf-8", errors="replace")[:6000]
    except HTTPException:
        readme_text = "README could not be retrieved."

    issue_text = "No issue selected."
    if request.issue_number:
        issue = github_get(f"/repos/{request.owner}/{request.repo}/issues/{request.issue_number}")
        if "pull_request" in issue:
            raise HTTPException(status_code=400, detail="Select an issue rather than a pull request.")
        issue_text = f"Title: {issue.get('title', '')}\nBody: {(issue.get('body') or '')[:5000]}"

    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        completion = client.chat.completions.create(
            model=model,
            temperature=0.2,
            messages=[
                {"role": "system", "content": (
                    "You are an open-source contribution mentor for beginners. Use only the supplied evidence for claims about this repository. "
                    "Be specific, explain jargon, separate verified facts from hypotheses, and do not claim to have run tests. "
                    "Do not suggest running untrusted code outside a sandbox. Return a clear answer with headings: "
                    "Plain-language explanation, What to inspect, Suggested steps, Tests to consider, Before opening a pull request."
                )},
                {"role": "user", "content": (
                    f"Repository: {repo_data.get('full_name')}\nDescription: {repo_data.get('description')}\n"
                    f"Primary language: {repo_data.get('language')}\nREADME excerpt:\n{readme_text}\n\n"
                    f"Issue:\n{issue_text}\n\nUser request: {request.question}"
                )}
            ],
        )
        answer = completion.choices[0].message.content or "The model returned an empty response."
        return {"answer": answer, "model": model, "repository": repo_data.get("full_name")}
   
    except Exception as exc:
        print(
            f"Groq provider error: {type(exc).__name__}: {exc}",
            flush=True,
        )
        raise HTTPException(
            status_code=502,
            detail="The AI provider request failed. Check the backend terminal for the error.",
        ) from exc
