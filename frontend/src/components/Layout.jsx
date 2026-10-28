import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Github, Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  ["/", "Home"],
  ["/repositories", "Repositories"],
  ["/issues", "Issues"],
  ["/assistant", "AI Assistant"],
  ["/testing", "Testing Guide"],
];

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/" onClick={() => setOpen(false)}>
          <span className="brand-mark"><Sparkles size={19} /></span>
          <span>OpenSource<span className="brand-accent">AI</span><small>CONTRIBUTION COMPANION</small></span>
        </Link>
        <button className="mobile-menu" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        <nav className={open ? "nav-links nav-open" : "nav-links"}>
          {links.map(([to, label]) => <NavLink key={to} to={to} end={to === "/"} onClick={() => setOpen(false)}>{label}</NavLink>)}
        </nav>
        <a className="topbar-github" href="https://github.com" target="_blank" rel="noreferrer"><Github size={16} /> GitHub</a>
      </header>
      <main>{children}</main>
      <footer className="footer">
        <div className="footer-brand"><span className="brand-mark"><Sparkles size={16} /></span> OpenSource AI</div>
        <p>Make your first contribution with confidence.</p>
        <span>Built for the next generation of open-source contributors.</span>
      </footer>
    </div>
  );
}
