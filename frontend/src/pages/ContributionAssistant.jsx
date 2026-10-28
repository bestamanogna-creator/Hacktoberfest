import React from "react";
import { useState } from "react";
import { api } from "../services/api";
import { PageHeader, EmptyState } from "../components/Shared";
import { Sparkles, Send, BookOpen, FileCode2, ListChecks, Lightbulb } from "lucide-react";

export default function ContributionAssistant() {
  const [repo, setRepo] = useState(() => { try { return JSON.parse(sessionStorage.getItem("osa_repo") || "null"); } catch { return null; } });
  const [issue, setIssue] = useState(() => { try { return JSON.parse(sessionStorage.getItem("osa_issue") || "null"); } catch { return null; } });
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  

async function ask(e) {
  e.preventDefault();
  setLoading(true);
  setError("");
  setAnswer("");

  try {
    const owner = repo?.owner?.login;
    const repoName = repo?.name;

    if (!owner || !repoName) {
      setError("Please select a repository from the Repository Explorer or Home page first.");
      return;
    }

    const response = await api.post("/api/assistant/explain", {
      owner,
      repo: repoName,
      issue_number: issue?.number ?? null,
      question:
        question.trim() ||
        "Explain this repository issue to a beginner and give a safe, step-by-step contribution plan."
    });

    setAnswer(
      typeof response.data?.answer === "string"
        ? response.data.answer
        : "The assistant returned an unexpected response."
    );
  } catch (e) {
    const detail = e.response?.data?.detail;

    let message = "AI request failed. Check the backend terminal for details.";

    if (typeof detail === "string") {
      message = detail;
    } else if (Array.isArray(detail)) {
      message = detail
        .map(item =>
          typeof item === "string" ? item : item.msg || JSON.stringify(item)
        )
        .join("; ");
    } else if (detail && typeof detail === "object") {
      message = detail.msg || JSON.stringify(detail);
    }

    setError(message);
  } finally {
    setLoading(false);
  }
}

  return <div className="page-wrap inner-page">
    <PageHeader eyebrow="YOUR AI PAIR GUIDE" title="Make the next step clear." description="Ask for a plain-language explanation, a plan to investigate an issue, or help understanding a repository."/>
    <div className="assistant-layout">
      <section className="panel assistant-context">
        <div className="panel-heading"><BookOpen size={18}/><h2>Working context</h2></div>
        {repo ? <div className="context-item"><span className="context-icon"><FileCode2 size={18}/></span><div><small>REPOSITORY</small><strong>{repo.full_name}</strong><p>{repo.description || "No description available."}</p></div></div> : <p className="muted-copy">No repository selected yet. Load one from the Repository Explorer or Home page.</p>}
        {issue ? <div className="context-item"><span className="context-icon violet"><ListChecks size={18}/></span><div><small>SELECTED ISSUE</small><strong>#{issue.number} · {issue.title}</strong><p>{(issue.body || "No issue description.").slice(0, 180)}</p></div></div> : <div className="context-hint"><Lightbulb size={17}/><p>Tip: select “Explain with AI” on an issue to bring it here.</p></div>}
      </section>
      <section className="panel assistant-panel">
        <div className="assistant-panel-heading"><span className="ai-avatar"><Sparkles size={19}/></span><div><h2>Contribution assistant</h2><p>Repository-aware guidance · AI-generated suggestions</p></div><span className="online-badge"><i/> READY</span></div>
        <div className="assistant-welcome"><span className="welcome-icon"><Sparkles size={23}/></span><h3>What are you working on?</h3><p>Ask a question and get a structured, beginner-friendly response.</p>
          <div className="suggestion-chips"><button onClick={() => setQuestion("Explain the selected issue in simple language.")}>Explain this issue</button><button onClick={() => setQuestion("Give me a step-by-step plan to investigate and solve this issue.")}>Create a contribution plan</button><button onClick={() => setQuestion("Suggest useful test cases and explain how to verify a fix.")}>Suggest tests</button></div>
        </div>
        {error && <div className="notice notice-error">{error}</div>}
        {answer && <div className="ai-answer"><div className="answer-label"><Sparkles size={15}/> AI RESPONSE</div><div className="answer-body">{answer}</div><p className="ai-disclaimer">Review suggestions against the source code and project guidelines before applying them.</p></div>}
        {loading && <div className="loading-panel">Preparing your contribution guidance…</div>}
        <form className="assistant-input" onSubmit={ask}><textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask about the issue, code structure, solution steps, or tests…" rows={3}/><div className="assistant-input-bottom"><span>AI can make mistakes. Verify source references.</span><button className="button button-primary" disabled={loading}><span>{loading ? "Thinking…" : "Ask assistant"}</span><Send size={15}/></button></div></form>
      </section>
    </div>
  </div>;
}
