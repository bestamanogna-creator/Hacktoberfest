import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, BookOpen, Braces, GitPullRequest, Github, Search, ShieldCheck, Sparkles, Terminal, Zap } from "lucide-react";
import { api, parseGitHubUrl } from "../services/api";
import { Eyebrow, FeatureCard, StepCard } from "../components/Shared";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function analyze(event) {
    event.preventDefault();
    setError("");
    try {
      const { owner, repo } = parseGitHubUrl(url);
      setLoading(true);
      const response = await api.get(`/api/repositories/${owner}/${repo}`);
      sessionStorage.setItem("osa_repo", JSON.stringify(response.data));
      sessionStorage.setItem("osa_repo_url", url);
      navigate("/repositories");
    } catch (e) {
      setError(e.response?.data?.detail || e.message || "Could not load this repository. Please try again.");
    } finally { setLoading(false); }
  }

  return <div className="home-page page-wrap">
    <section className="hero">
      <div className="hero-copy">
        <Eyebrow>YOUR OPEN-SOURCE JOURNEY STARTS HERE</Eyebrow>
        <h1>Go from <span className="gradient-text">curious</span> to<br/>contributor.</h1>
        <p className="hero-description">Understand unfamiliar codebases, decode issues, and find your next step — with an AI companion built for open-source beginners.</p>
        <form className="repo-form" onSubmit={analyze}>
          <Github size={20} className="form-github"/>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste a GitHub repository URL..." aria-label="GitHub repository URL" required />
          <button className="button button-primary" disabled={loading}>{loading ? "Analyzing…" : "Analyze repo"} <ArrowRight size={17}/></button>
        </form>
        {error && <p className="error-text">{error}</p>}
        <div className="hero-note"><ShieldCheck size={15}/> Public repositories · AI suggestions you can verify</div>
        <div className="hero-metrics"><div><strong>01</strong><span>Explore a repo</span></div><div><strong>02</strong><span>Understand an issue</span></div><div><strong>03</strong><span>Contribute with confidence</span></div></div>
      </div>
      <div className="hero-visual">
        <div className="glow-orb orb-one"/><div className="glow-orb orb-two"/>
        <div className="code-window">
          <div className="window-bar"><div className="window-dots"><i/><i/><i/></div><span>contribution-plan.md</span><span className="live-badge"><span/> READY</span></div>
          <div className="code-content">
            <div className="code-line"><span className="line-no">01</span><span className="code-purple"># Your first contribution</span></div>
            <div className="code-line"><span className="line-no">02</span></div>
            <div className="code-line"><span className="line-no">03</span><span className="code-green">✓</span><span>Understand the issue</span></div>
            <div className="code-line"><span className="line-no">04</span><span className="code-green">✓</span><span>Locate relevant files</span></div>
            <div className="code-line"><span className="line-no">05</span><span className="code-blue">→</span><span>Plan a minimal fix</span></div>
            <div className="code-line"><span className="line-no">06</span><span className="code-muted">○</span><span>Run tests and verify</span></div>
            <div className="code-line"><span className="line-no">07</span><span className="code-muted">○</span><span>Prepare pull request</span></div>
          </div>
          <div className="ai-insight"><span className="ai-insight-icon"><Sparkles size={16}/></span><div><strong>AI insight</strong><p>Start small. A well-tested documentation fix is a real contribution.</p></div></div>
        </div>
        <div className="floating-card floating-card-top"><span className="floating-icon"><Braces size={17}/></span><div><strong>Repository-aware</strong><small>Context, not guesswork</small></div></div>
        <div className="floating-card floating-card-bottom"><span className="floating-icon purple"><Zap size={17}/></span><div><strong>Guided workflow</strong><small>One step at a time</small></div></div>
      </div>
    </section>

    <section className="section-block">
      <div className="section-heading"><div><Eyebrow>BUILT FOR YOUR FIRST PR</Eyebrow><h2>Everything you need to <span className="gradient-text">get unstuck.</span></h2></div><p>From your first repository tour to your pull-request checklist, turn uncertainty into a clear plan.</p></div>
      <div className="feature-grid">
        <FeatureCard icon={Search} number="01" title="Explore repositories" text="Get a clear overview of a project's purpose, language, files, and documentation."/>
        <FeatureCard icon={BookOpen} number="02" title="Decode issues" text="Turn technical issue descriptions into plain-language goals and actionable steps."/>
        <FeatureCard icon={Sparkles} number="03" title="Ask AI for guidance" text="Get context-aware suggestions and a practical plan for investigating a problem."/>
        <FeatureCard icon={Terminal} number="04" title="Test with confidence" text="Understand test workflows and prepare a checklist before you open a pull request."/>
      </div>
    </section>

    <section className="workflow-section">
      <div className="section-heading"><div><Eyebrow>A CLEARER PATH</Eyebrow><h2>From issue to <span className="gradient-text">contribution.</span></h2></div></div>
      <div className="steps-grid">
        <StepCard number="01" title="Choose a repository" text="Start with a public GitHub project that interests you."/>
        <StepCard number="02" title="Understand the issue" text="Break down the problem and explore relevant files."/>
        <StepCard number="03" title="Build a plan" text="Get suggested steps, tests, and a PR checklist."/>
      </div>
    </section>
    <section className="cta-banner"><div><span className="cta-icon"><GitPullRequest size={21}/></span><h2>Your next contribution can start today.</h2><p>Pick a repository. Ask better questions. Take the next step.</p></div><button className="button button-primary" onClick={() => document.querySelector(".repo-form input")?.focus()}>Explore a repository <ArrowUpRight size={17}/></button></section>
  </div>;
}
