import React from "react";
import { useState } from "react";
import { PageHeader, FeatureCard } from "../components/Shared";
import { CheckCircle2, ClipboardCheck, Code2, FileCheck2, FlaskConical, GitPullRequest, ShieldCheck } from "lucide-react";

const initial = [
  "Read the repository contribution guidelines",
  "Reproduce the issue before changing code",
  "Inspect relevant code and existing tests",
  "Add or update tests for the expected behavior",
  "Run the relevant test suite",
  "Review the diff for unrelated changes",
  "Write a clear pull-request summary",
];
export default function TestingGuide() {
  const [checked, setChecked] = useState([]);
  const [projectType, setProjectType] = useState("python");
  const [copied, setCopied] = useState(false);
  const commands = { python: "python -m pytest", javascript: "npm test", node: "npm test", rust: "cargo test", go: "go test ./..." };
  const command = commands[projectType] || "Check the repository README for its test command.";
  const toggle = i => setChecked(old => old.includes(i) ? old.filter(x => x !== i) : [...old, i]);
  async function copy() { try { await navigator.clipboard.writeText(initial.map((x, i) => `${checked.includes(i) ? "[x]" : "[ ]"} ${x}`).join("\n")); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { setCopied(false); } }

  return <div className="page-wrap inner-page">
    <PageHeader eyebrow="QUALITY & CONTRIBUTION" title="Ship changes with confidence." description="Use this practical checklist to understand tests, verify your changes, and prepare a clear pull request."/>
    <div className="feature-grid testing-features">
      <FeatureCard icon={FlaskConical} number="01" title="Understand tests" text="Find existing tests and identify the behavior they verify."/>
      <FeatureCard icon={ShieldCheck} number="02" title="Validate changes" text="Check edge cases and confirm the fix does not break existing behavior."/>
      <FeatureCard icon={GitPullRequest} number="03" title="Prepare your PR" text="Explain the problem, summarize the change, and link relevant issues."/>
    </div>
    <div className="content-grid testing-grid">
      <section className="panel content-panel"><div className="panel-heading"><ClipboardCheck size={18}/><h2>Contribution checklist</h2><span className="small-count">{checked.length}/{initial.length}</span></div><div className="progress-track"><span style={{width: `${checked.length / initial.length * 100}%`}}/></div>
        <div className="checklist">{initial.map((item, i) => <label className={checked.includes(i) ? "check-row is-checked" : "check-row"} key={item}><input type="checkbox" checked={checked.includes(i)} onChange={() => toggle(i)}/><span className="custom-check"><CheckCircle2 size={17}/></span><span>{item}</span></label>)}</div>
        <button className="button button-secondary full-button" onClick={copy}><ClipboardCheck size={16}/>{copied ? "Checklist copied" : "Copy checklist"}</button>
      </section>
      <section className="panel content-panel"><div className="panel-heading"><Code2 size={18}/><h2>Test command helper</h2></div><p className="muted-copy">Choose a project type to see a common test command. Confirm the actual command in the repository README or contribution guide.</p>
        <label className="field-label" htmlFor="project-type">Project type</label><select id="project-type" className="select-field" value={projectType} onChange={e => setProjectType(e.target.value)}><option value="python">Python</option><option value="javascript">JavaScript</option><option value="node">Node.js</option><option value="rust">Rust</option><option value="go">Go</option></select>
        <div className="command-box"><span>$</span><code>{command}</code></div><div className="notice notice-info"><FileCheck2 size={17}/><span>This tool displays a suggested command only. It has not executed tests in the selected repository.</span></div>
      </section>
    </div>
    <section className="cta-banner testing-cta"><div><span className="cta-icon"><GitPullRequest size={21}/></span><h2>Small, verified changes matter.</h2><p>A clear explanation and reliable tests help maintainers review your contribution.</p></div></section>
  </div>;
}
