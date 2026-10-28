import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { PageHeader, EmptyState } from "../components/Shared";
import { Search, CircleDot, ExternalLink, Sparkles, Tag } from "lucide-react";

export default function IssuesExplorer() {
  const [issues, setIssues] = useState([]);
  const [repo, setRepo] = useState(() => { try { return JSON.parse(sessionStorage.getItem("osa_repo") || "null"); } catch { return null; } });
  const [url, setUrl] = useState(() => sessionStorage.getItem("osa_repo_url") || "");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function load(owner, name) {
    setLoading(true); setError("");
    try {
      const [r, i] = await Promise.all([api.get(`/api/repositories/${owner}/${name}`), api.get(`/api/repositories/${owner}/${name}/issues`)]);
      setRepo(r.data); setIssues(i.data.issues || []);
      sessionStorage.setItem("osa_repo", JSON.stringify(r.data));
      sessionStorage.setItem("osa_repo_url", `https://github.com/${owner}/${name}`);
    } catch (e) { setError(e.response?.data?.detail || "Could not load issues."); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (repo?.owner?.login && repo?.name) load(repo.owner.login, repo.name); }, []);
  const filtered = issues.filter(i => `${i.title} ${i.body || ""} ${(i.labels || []).map(l => l.name).join(" ")}`.toLowerCase().includes(query.toLowerCase()));

  return <div className="page-wrap inner-page">
    <PageHeader eyebrow="ISSUE DISCOVERY" title="Find a place to start." description="Browse open issues and identify a problem you can understand, investigate, and help solve."/>
    <form className="search-panel" onSubmit={e => { e.preventDefault(); const m = url.trim().match(/^https?:\/\/github\.com\/([^/]+)\/([^/#?]+)/i); if (!m) { setError("Enter a valid public GitHub repository URL."); return; } load(m[1], m[2].replace(/\.git$/i, "")); }}>
      <Search size={18}/><input value={url} onChange={e => setUrl(e.target.value)} placeholder="Load issues from a GitHub repository" aria-label="Repository URL"/><button className="button button-primary" disabled={loading}>{loading ? "Loading…" : "Load issues"}</button>
    </form>
    {error && <div className="notice notice-error">{error}</div>}
    {repo && <div className="issues-toolbar"><div><span className="status-dot"/> <strong>{repo.full_name}</strong><span className="muted-copy"> · {issues.length} issues loaded</span></div><div className="filter-input"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search issues…"/></div></div>}
    {loading && <div className="loading-panel">Fetching issues from GitHub…</div>}
    {!repo && !loading && <EmptyState title="No repository selected" text="Load a public GitHub repository to browse its open issues."/>}
    {repo && !loading && <div className="issue-list">{filtered.map(issue => <article className="issue-card panel" key={issue.id}>
      <div className="issue-icon"><CircleDot size={19}/></div><div className="issue-main"><div className="issue-title-row"><h3>{issue.title}</h3><a href={issue.html_url} target="_blank" rel="noreferrer" aria-label="Open issue on GitHub"><ExternalLink size={15}/></a></div><p className="issue-meta">#{issue.number} opened by {issue.user?.login || "unknown"} · {new Date(issue.created_at).toLocaleDateString()}</p><p className="issue-description">{(issue.body || "No description provided.").slice(0, 260)}{(issue.body || "").length > 260 ? "…" : ""}</p><div className="issue-bottom"><div className="label-list">{(issue.labels || []).slice(0, 4).map(label => <span className="issue-label" key={label.id || label.name}><Tag size={11}/>{label.name}</span>)}</div><button className="text-button" onClick={() => { sessionStorage.setItem("osa_issue", JSON.stringify(issue)); navigate("/assistant"); }}>Explain with AI <Sparkles size={15}/></button></div></div>
    </article>)}</div>}
    {repo && !loading && filtered.length === 0 && <EmptyState title="No matching issues" text="Try a different search phrase or load another repository."/>}
  </div>;
}
