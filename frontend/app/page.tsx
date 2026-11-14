"use client";

import { useState } from "react";
import Link from "next/link";

const navigation = [
  { label: "Features", target: "features" },
  { label: "Pricing", target: "pricing" },
];

function ArrowUpRight() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="button-icon">
      <path d="M3 13 13 3M5 3h8v8" />
    </svg>
  );
}

function PlayMark() {
  return (
    <span className="brand-logo" aria-hidden="true">
      <img src="/sublime_logo_icon.png" alt="" />
    </span>
  );
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("Features");

  const handleNavigation = (label: string, target: string) => {
    setActiveSection(label);
    document.getElementById(target)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <main>
      <nav className="site-nav" aria-label="Main navigation">
        <button className="brand" onClick={() => handleNavigation("Features", "hero")} aria-label="Sublimer home">
          <PlayMark />
          <span>Sublimer</span>
        </button>

        <div className="nav-links">
          {navigation.map((item) => (
            <button
              className={activeSection === item.label ? "nav-link active" : "nav-link"}
              key={item.label}
              onClick={() => handleNavigation(item.label, item.target)}
            >
              {item.label}
            </button>
          ))}
          <Link className={activeSection === "Docs" ? "nav-link active" : "nav-link"} href="/docs">Docs</Link>
          <Link className={activeSection === "Blogs" ? "nav-link active" : "nav-link"} href="/blogs">Blogs</Link>
        </div>

        <button className="google-button">
          <span className="google-g">G</span>
          Sign up with Google
        </button>
      </nav>

      <section className="hero" id="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> AI-powered video workflow</div>
          <h1>Clips to upload-ready content <em>in minutes.</em></h1>
          <p>
            Sublimer turns your raw videos into polished, captioned content
            ready to share. Create more, spend less time editing.
          </p>
          <div className="hero-actions">
            <button className="primary-button">Start creating <ArrowUpRight /></button>
            <Link className="text-button" href="/docs">See how it works <span>↓</span></Link>
          </div>
          <div className="hero-note"><span className="note-line" /> No credit card required</div>
        </div>

        <div className="hero-visual" aria-label="Sublimer video workspace preview">
          <div className="visual-glow" />
          <div className="window-card">
            <div className="window-top">
              <span className="window-dots"><i /><i /><i /></span>
              <span className="window-title">sublimer / new project</span>
              <span className="window-status">● autosaved</span>
            </div>
            <div className="preview">
              <div className="preview-label">PREVIEW</div>
              <div className="preview-subject"><span className="subject-sun" /><span className="subject-head" /><span className="subject-body" /></div>
              <div className="preview-caption">Make every clip <strong>count.</strong></div>
              <button className="preview-play" aria-label="Play preview">▶</button>
            </div>
            <div className="timeline">
              <span className="timeline-time">00:12</span>
              <div className="timeline-track"><span className="timeline-progress" /></div>
              <span className="timeline-time">00:48</span>
            </div>
            <div className="tool-row"><span>✦ Captions</span><span>◌ Audio</span><span>↗ Export</span></div>
          </div>
        </div>
      </section>

      <section className="statement" id="features" aria-label="Features">
        <p>Less editing. More creating.</p>
        <h2>One calm workspace for turning raw clips into content people want to watch.</h2>
      </section>

      <section className="pricing-section" id="pricing" aria-label="Pricing">
        <div className="pricing-heading">
          <span className="section-kicker">01</span><h2>Pricing</h2><p>Simple plans for every stage of your creative workflow.</p>
        </div>
        <div className="pricing-placeholder">Plans and pricing will be available here soon.</div>
      </section>

      <footer><span><PlayMark /> Sublimer</span><span>Built for the next generation of creators.</span></footer>
    </main>
  );
}
