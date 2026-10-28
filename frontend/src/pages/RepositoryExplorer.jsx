import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen, ExternalLink, GitFork, Github, Star, GitPullRequest, Code2 } from "lucide-react";
import { api } from "../services/api";
import { PageHeader, EmptyState } from "../components/Shared";

export default function RepositoryExplorer() {
  const [repo, setRepo] = useState(() => { try { return JSON.parse(sessionStorage.getItem("osa_repo") || "null"); } catch { return null; } });
  const [url, setUrl] = useState(() => sessionStorage.getItem("osa_repo_url") || "");
  const [readme, setReadme] = useState("");
  const [tree, setTree] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(owner, name) {
    setLoading(true); setError("");
    try {
      const [r, rd, tr] = await Promise.all([
        api.get(`/api/repositories/${owner}/${name}`),
        api.get(`/api/repositories/${owner}/${name}/readme`),
        api.get(`/api/repositories/${owner}/${name}/tree`)
      ]);
      setRepo(r.data); setReadme(rd.data.content || "No README found."); setTree(tr.data.files || []);
      sessionStorage.setItem("osa_repo", JSON.stringify(r.data));
      sessionStorage.setItem("osa_repo_url", `https://github.com/${owner}/${name}`);
    } catch (e) { setError(e.response?.data?.detail || "Could not load repository details."); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (repo && repo.owner?.login && repo.name) load(repo.owner.login, repo.name); }, []);

  return <div className="page-wrap inner-page">
    <PageHeader eyebrow="REPOSITORY WORKSPACE" title="Explore a codebase." description="Get familiar with a project's purpose, structure, and documentation before you start contributing."/>
    <form className="search-panel" onSubmit={e => { e.preventDefault(); const m = url.trim().match(/^https?:\/\/github\.com\/([^/]+)\/([^/#?]+)/i); if (!m) { setError("Enter a valid public GitHub repository URL."); return; } load(m[1], m[2].replace(/\.git$/i, "")); }}>
      <Github size={19}/><input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://github.com/owner/repository" aria-label="Repository URL"/><button className="button button-primary" disabled={loading}>{loading ? "Loading…" : "Load repository"}</button>
    </form>
    {error && <div className="notice notice-error">{error}</div>}
    {loading && <div className="loading-panel">Loading repository information…</div>}
    {!repo && !loading && <EmptyState title="Start with a repository" text="Enter a public GitHub URL above, or return home to begin your first repository analysis."/>}
    {repo && !loading && <>
      <section className="repo-overview panel">
        <div className="repo-title-row"><span className="repo-avatar"><Code2 size={24}/></span><div className="repo-title"><div className="repo-name">{repo.full_name}<span className="visibility-tag">PUBLIC</span></div><p>{repo.description || "No repository description provided."}</p></div><a className="icon-link" href={repo.html_url} target="_blank" rel="noreferrer" aria-label="Open GitHub repository"><ExternalLink size={18}/></a></div>
        <div className="repo-stats"><span><Star size={16}/>{(repo.stargazers_count || 0).toLocaleString()} stars</span><span><GitFork size={16}/>{(repo.forks_count || 0).toLocaleString()} forks</span><span><Code2 size={16}/>{repo.language || "Language not specified"}</span><span><GitPullRequest size={16}/>{repo.open_issues_count || 0} open issues</span></div>
        <div className="repo-actions"><Link className="button button-primary" to="/issues">Explore issues <ArrowUpRight size={16}/></Link><Link className="button button-secondary" to="/assistant">Open AI assistant</Link></div>
      </section>
      <div className="content-grid">
        <section className="panel content-panel"><div className="panel-heading"><BookOpen size={18}/><h2>README overview</h2></div><div className="readme-content">{readme ? readme.slice(0, 7000) : "Loading README…"}</div></section>
        <section className="panel content-panel"><div className="panel-heading"><Code2 size={18}/><h2>Repository files</h2><span className="small-count">{tree.length}</span></div><p className="muted-copy">Top-level and nested paths from the default branch.</p><div className="file-list">{tree.slice(0, 40).map((f, i) => <div className="file-row" key={`${f.path}-${i}`}><span className={f.type === "dir" ? "file-symbol folder" : "file-symbol"}>{f.type === "dir" ? "▰" : "⌁"}</span><span>{f.path}</span><span className="file-type">{f.type === "dir" ? "DIR" : "FILE"}</span></div>)}</div></section>
      </div>
    </>}
  </div>;
}
