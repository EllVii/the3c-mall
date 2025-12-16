// src/components/grocery/StoreRequestPanel.jsx
import React, { useState } from "react";

export default function StoreRequestPanel() {
  const [store, setStore] = useState("");

  return (
    <div className="card">
      <h3>Request a Store</h3>
      <input
        className="input"
        placeholder="Enter store name"
        value={store}
        onChange={(e) => setStore(e.target.value)}
      />
      <button
        className="btn btn-primary"
        style={{ marginTop: ".6rem" }}
        onClick={() => {
          alert(`Request submitted for ${store}`);
          setStore("");
        }}
      >
        Submit Request
      </button>
    </div>
  );
}
