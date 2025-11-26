import { Link } from "react-router-dom";

function Home() {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="pill">Carnivore • Cost • Community</p>
        <h1>
          Eat smarter, spend less,
          <span className="highlight"> never do it alone.</span>
        </h1>
        <p className="hero-subtitle">
          The 3C Lifestyle Mall is your concierge for carnivore, keto, and
          budget-friendly living — with real people, real prices, and real
          rewards for showing up.
        </p>

        <div className="hero-actions">
          <a href="/app" className="primary-btn">
            Open the 3C App
          </a>
          <Link to="/pricing" className="secondary-btn">
            View Plans &amp; Perks
          </Link>
        </div>

        <ul className="hero-benefits">
          <li>📊 Local grocery cost comparison</li>
          <li>🥩 30-day protein-first meal plans</li>
          <li>🎖 80/20 lifestyle rewards</li>
          <li>🧠 Emotionally safe coaching &amp; community</li>
        </ul>
      </div>

      <div className="hero-panel">
        <div className="card">
          <h2>Today at your 3C Mall</h2>
          <p>210g protein • $12.60 meat cost • 90% on track this month.</p>
          <p className="muted">“You’re aging like fine wine, not like a boomer.” 🍷</p>
        </div>
        <div className="card subtle">
          <p>F3, Military, and Students unlock special lifetime perks.</p>
        </div>
      </div>
    </section>
  );
}

export default Home;
