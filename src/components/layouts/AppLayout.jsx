import { useState } from "react";

const menuItems = ["Today", "Meal Plan", "Groceries", "Rewards", "Community", "Labs"];

function AppLayout({ children }) {
  const [active, setActive] = useState("Today");

  return (
    <div className="app-root">
      <aside className="app-sidebar">
        <div className="app-logo">
          <span className="logo-mark">3C</span>
          <span className="logo-text">Mall</span>
        </div>
        <nav className="app-nav">
          {menuItems.map((item) => (
            <button
              key={item}
              className={`app-nav-item ${active === item ? "active" : ""}`}
              onClick={() => setActive(item)}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="app-sidebar-footer">
          <small>
            Wordsmithing: <strong>ON</strong> (toggle later)
          </small>
        </div>
      </aside>

      <section className="app-content">
        <header className="app-topbar">
          <h1>{active}</h1>
          <div className="app-user">
            <span className="avatar">LV</span>
            <span className="user-meta">
              <strong>Lawrence</strong>
              <small>3C Founder</small>
            </span>
          </div>
        </header>

        <div className="app-inner">{children}</div>
      </section>
    </div>
  );
}

export default AppLayout;
