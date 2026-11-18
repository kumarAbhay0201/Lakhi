import Link from "next/link";
import WaitingListButton from "../components/WaitingListButton";

function PlayMark() {
  return <span className="brand-logo" aria-hidden="true"><img src="/sublime_logo_icon.png" alt="" /></span>;
}

export default function DocsPage() {
  return (
    <main className="page-transition">
      <nav className="site-nav" aria-label="Main navigation">
        <Link className="brand" href="/"><PlayMark /><span>Sublimer</span></Link>
        <div className="nav-links">
          <Link className="nav-link" href="/#features">Features</Link>
          <Link className="nav-link" href="/#pricing">Pricing</Link>
          <Link className="nav-link active" href="/docs">Docs</Link>
          <Link className="nav-link" href="/blogs">Blogs</Link>
        </div>
        <WaitingListButton />
      </nav>
      <section className="content-page">
        <div className="eyebrow"><span className="eyebrow-dot" /> Sublimer guides</div>
        <h1>Docs</h1>
        <p>Everything you need to get the most from Sublimer.</p>
      </section>
    </main>
  );
}
