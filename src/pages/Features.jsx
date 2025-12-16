import React from "react";

export default function Features() {
  const items = [
    { title: "Meal Plans", desc: "Plan meals by time, household, and eating style." },
    { title: "Grocery Lab", desc: "Delivery OR pickup. Use the app in-store and check off your list." },
    { title: "Community", desc: "Momentum tools, streak rewards, and real people." },
    { title: "PT Mode", desc: "Trainer dashboard + client control tools." },
  ];

  return (
    <section className="page-wrap">
      <p className="kicker">PUBLIC • FEATURES</p>
      <h2 className="h2">Features</h2>

      <div className="grid-cards">
        {items.map((x) => (
          <div key={x.title} className="card card-pad">
            <div className="card-title">{x.title}</div>
            <p className="card-text">{x.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
