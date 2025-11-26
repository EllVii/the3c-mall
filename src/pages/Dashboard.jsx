function Dashboard() {
  return (
    <div className="dashboard">
      <section className="card">
        <h2>Today’s Snapshot</h2>
        <ul className="stat-row">
          <li>
            <strong>210g</strong>
            <span>Target protein</span>
          </li>
          <li>
            <strong>$12.60</strong>
            <span>Estimated meat cost</span>
          </li>
          <li>
            <strong>82%</strong>
            <span>On-track this month</span>
          </li>
        </ul>
      </section>

      <section className="grid">
        <article className="card">
          <h3>Current 30-Day Cycle</h3>
          <p>
            You’re in Week 2 of your current 30-day rhythm. Your next two days
            are <strong>Lean Beef Day</strong> and{" "}
            <strong>Chicken + Beef Day</strong>.
          </p>
        </article>
        <article className="card">
          <h3>Grocery Watchlist</h3>
          <p>
            Eye of round is trending down at your preferred store. Good time to
            stock up and freeze 5–10 lbs.
          </p>
        </article>
        <article className="card">
          <h3>Rewards &amp; 80/20</h3>
          <p>
            You’re at <strong>4:1</strong> days on-plan vs flex days. That’s
            above the 80/20 mark — you’ve unlocked a new streak badge.
          </p>
        </article>
      </section>
    </div>
  );
}

export default Dashboard;
