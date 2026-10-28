import React from "react";
import { ArrowUpRight, BookOpen, Code2, GitPullRequest, ShieldCheck, Sparkles } from "lucide-react";

export function Eyebrow({ children }) { return <div className="eyebrow"><span className="eyebrow-dot" />{children}</div>; }
export function PageHeader({ eyebrow, title, description, action }) {
  return <div className="page-header"><div><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}
export function FeatureCard({ icon: Icon = Sparkles, title, text, number }) {
  return <article className="feature-card"><div className="feature-card-top"><span className="icon-tile"><Icon size={20}/></span><span className="feature-number">{number}</span></div><h3>{title}</h3><p>{text}</p></article>;
}
export function StepCard({ number, title, text }) {
  return <div className="step-card"><span className="step-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div><ArrowUpRight size={18} className="muted-icon"/></div>;
}
export function EmptyState({ title, text }) {
  return <div className="empty-state"><span className="icon-tile"><BookOpen size={22}/></span><h3>{title}</h3><p>{text}</p></div>;
}
export const icons = { Code2, GitPullRequest, ShieldCheck, Sparkles };
