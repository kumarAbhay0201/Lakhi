import Link from "next/link";

function PlayMark() {
  return <span className="brand-logo" aria-hidden="true"><img src="/sublime_logo_icon.png" alt="" /></span>;
}

export default function BlogsPage() {
  return (
    <main className="page-transition">
      <nav className="site-nav" aria-label="Main navigation">
        <Link className="brand" href="/"><PlayMark /><span>Sublimer</span></Link>
        <div className="nav-links">
          <Link className="nav-link" href="/#features">Features</Link>
          <Link className="nav-link" href="/#pricing">Pricing</Link>
          <Link className="nav-link" href="/docs">Docs</Link>
          <Link className="nav-link active" href="/blogs">Blogs</Link>
        </div>
        <button className="google-button"><span className="google-g">G</span>Sign up with Google</button>
      </nav>
      <section className="content-page">
        <div className="eyebrow"><span className="eyebrow-dot" /> From the studio</div>
        <h1>Blogs</h1>
        <p>Ideas, workflows, and stories from the creator community.</p>
      </section>
    </main>
  );
}
