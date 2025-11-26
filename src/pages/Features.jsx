function Features() {
  const features = [
    {
      title: "3C Concierge",
      desc: "A guide that talks in your tone, respects your energy, and keeps you emotionally safe while you change your life.",
    },
    {
      title: "Carnivore Cost Engine",
      desc: "Track price-per-pound from your local stores, build 30-day plans, and see your true cost per day, not just macros.",
    },
    {
      title: "80/20 Rewards",
      desc: "Stay on track at least 80% of the time and unlock rewards, streaks, and surprise boosts instead of punishment.",
    },
    {
      title: "Family & Bundles",
      desc: "Household accounts, student & military lifetime options, and F3 perks for the brothers who show up.",
    },
    {
      title: "Labs, Centers & Zones",
      desc: "Experiment with new habits in low-pressure Labs, track your gains in Centers, and protect your mental health Zones.",
    },
    {
      title: "Wordsmithing ON/OFF",
      desc: "Choose between raw, relatable coaching or clean, clinical language — your vibe, your rules.",
    },
  ];

  return (
    <section className="page">
      <h1>Why the 3C Lifestyle Mall works</h1>
      <p className="page-subtitle">
        Real results come from a mix of clarity, support, and flexibility. The
        3C Mall is built to keep you in the game, not grind you down.
      </p>

      <div className="grid">
        {features.map((f) => (
          <article key={f.title} className="card">
            <h2>{f.title}</h2>
            <p>{f.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Features;
