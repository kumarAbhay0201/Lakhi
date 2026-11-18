"use client";

import { useState } from "react";
import Link from "next/link";
import WaitingListButton from "./components/WaitingListButton";

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

        <WaitingListButton />
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

      <section className="features-section" id="features" aria-label="Features">
        <div className="features-heading">
          <p>Less editing. More creating.</p>
          <h2>Everything you need to make every clip count.</h2>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-card-top">
              <span className="feature-number">01</span>
              <span className="feature-status">Available now</span>
            </div>
            <div>
              <h3>Auto-caption</h3>
              <p>Make every word clear with accurate captions in six European languages.</p>
            </div>
            <div className="language-list" aria-label="Supported languages">
              <span>English</span>
              <span>German</span>
              <span>French</span>
              <span>Spanish</span>
              <span>Italian</span>
              <span>Dutch</span>
            </div>
          </article>

          <article className="feature-card feature-card-coming-soon">
            <div className="feature-card-top">
              <span className="feature-number">02</span>
              <span className="feature-status">Coming soon</span>
            </div>
            <div>
              <h3>Raw clips to fully engaging content</h3>
              <p>Turn raw footage into content people want to watch with motion graphics, captions, and color grading.</p>
            </div>
            <span className="feature-version">Planned for v2</span>
          </article>
        </div>
      </section>

      <section className="pricing-section" id="pricing" aria-label="Pricing">
        <div className="pricing-heading">
          <span className="section-kicker">01</span><h2>Pricing</h2><p>Simple plans for every stage of your creative workflow.</p>
        </div>
        <div className="pricing-grid">
          <article className="pricing-card">
            <div className="pricing-card-heading">
              <span className="pricing-label">Free</span>
              <p>Start creating with the essentials.</p>
            </div>
            <div className="pricing-price"><strong>€0</strong><span>/ month</span></div>
            <ul className="pricing-features">
              <li>5 auto-caption videos / month</li>
              <li>3 v2 feature videos / month</li>
            </ul>
            <button className="pricing-button">Get started</button>
          </article>

          <article className="pricing-card pricing-card-featured">
            <div className="pricing-card-heading">
              <div className="pricing-title-row"><span className="pricing-label">Pro</span><span className="pricing-badge">Most popular</span></div>
              <p>More room for your creative workflow.</p>
            </div>
            <div className="pricing-price"><strong>€29</strong><span>/ month</span></div>
            <ul className="pricing-features">
              <li>45 auto-caption videos / month</li>
              <li>25 v2 feature videos / month</li>
            </ul>
            <button className="pricing-button">Choose Pro</button>
          </article>

          <article className="pricing-card pricing-card-coming-soon">
            <div className="pricing-card-heading">
              <div className="pricing-title-row"><span className="pricing-label">Editors Pro</span><span className="pricing-badge">Coming soon</span></div>
              <p>Built for teams and high-volume editing.</p>
            </div>
            <div className="pricing-price"><strong>€79</strong><span>/ month</span></div>
            <ul className="pricing-features">
              <li>Advanced editing workflow</li>
              <li>More coming in v2</li>
            </ul>
            <button className="pricing-button" disabled>Coming soon</button>
          </article>
        </div>
      </section>

      <footer><span><PlayMark /> Sublimer</span><span>Built for the next generation of creators.</span></footer>
    </main>
  );
}
