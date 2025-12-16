// src/pages/LandingPage.jsx
import React from "react";

export default function LandingPage() {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 0", color: "#fff" }}>
      <p style={{ color: "rgba(126,224,255,0.9)", fontWeight: 800, letterSpacing: "0.08em" }}>
        CARNIVORE • COST • COMMUNITY
      </p>

      <h1 style={{ fontSize: "2.6rem", lineHeight: 1.05, margin: "0.6rem 0 1rem" }}>  
        Eat smarter, spend less, <span style={{ color: "#f6dc8a" }}>never do it alone.</span>  
      </h1>  

      <p style={{ color: "rgba(255,255,255,0.75)", maxWidth: 720, fontSize: "1.05rem" }}>  
        The 3C Mall is your guided lifestyle dashboard: meal plans, grocery labs, and coaching tools—built for real life.  
      </p>  

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", flexWrap: "wrap" }}>  
        <a  
          href="/pricing"  
          style={{  
            display: "inline-block",  
            padding: "0.85rem 1.1rem",  
            borderRadius: 12,  
            background: "#f6dc8a",  
            color: "#111",  
            fontWeight: 900,  
            textDecoration: "none",  
          }}  
        >  
          View Pricing  
        </a>  

        <a  
          href="/app"  
          style={{  
            display: "inline-block",  
            padding: "0.85rem 1.1rem",  
            borderRadius: 12,  
            background: "rgba(126,224,255,0.12)",  
            color: "#7ee0ff",  
            fontWeight: 900,  
            textDecoration: "none",  
            border: "1px solid rgba(126,224,255,0.35)",  
          }}  
        >  
          Enter Dashboard  
        </a>  
      </div>  
    </section>
  );
}