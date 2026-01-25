// src/assets/components/PT/PTMessaging.jsx
import React, { useState, useRef, useEffect } from "react";
import "./PTMessaging.css";

const MOCK_MESSAGES = {
  c1: [
    { id: "m1", from: "client", text: "Hey coach, feeling really tired today. Should I still do the full workout?", timestamp: "2026-01-25 09:30" },
    { id: "m2", from: "trainer", text: "Listen to your body. Let's scale it back to 70% intensity today. Recovery is progress.", timestamp: "2026-01-25 09:45" },
    { id: "m3", from: "client", text: "Thanks! That sounds much better.", timestamp: "2026-01-25 09:47" },
    { id: "m4", from: "trainer", text: "Perfect. Let me know how you feel after. We can adjust tomorrow's session if needed.", timestamp: "2026-01-25 09:48" },
  ],
  c2: [
    { id: "m1", from: "client", text: "Protein goal is tough to hit. Any tips?", timestamp: "2026-01-24 14:20" },
    { id: "m2", from: "trainer", text: "Let's add a protein shake post-workout. That's an easy 25-30g right there.", timestamp: "2026-01-24 14:25" },
  ],
  c3: [
    { id: "m1", from: "client", text: "Hit a new PR on deadlift today! 315lbs!", timestamp: "2026-01-23 18:00" },
    { id: "m2", from: "trainer", text: "That's HUGE! Great work. Let's capitalize on that strength next week.", timestamp: "2026-01-23 18:15" },
  ],
};

export default function PTMessaging({ clientId, clientName }) {
  const [messages, setMessages] = useState(MOCK_MESSAGES[clientId] || []);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    const text = newMessage.trim();
    if (!text) return;

    const msg = {
      id: `m${Date.now()}`,
      from: "trainer",
      text,
      timestamp: new Date().toLocaleString("en-US", { 
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="pt-messaging">
      <div className="pt-messaging-header">
        <div className="pt-messaging-title">
          💬 Messages with {clientName}
        </div>
        <div className="pt-messaging-status">
          <span className="status-dot"></span> Active
        </div>
      </div>

      {/* Scrollable message area */}
      <div className="pt-messaging-scroll" ref={scrollContainerRef}>
        {messages.length === 0 ? (
          <div className="pt-messaging-empty">
            No messages yet. Start the conversation with {clientName}!
          </div>
        ) : (
          <div className="pt-messaging-list">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`pt-message ${msg.from === "trainer" ? "pt-message-trainer" : "pt-message-client"}`}
              >
                <div className="pt-message-bubble">
                  <div className="pt-message-text">{msg.text}</div>
                  <div className="pt-message-time">{msg.timestamp}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message input (fixed at bottom) */}
      <div className="pt-messaging-input-area">
        <textarea
          className="pt-messaging-input"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
          rows={3}
        />
        <button
          className="pt-messaging-send"
          onClick={sendMessage}
          disabled={!newMessage.trim()}
        >
          Send →
        </button>
      </div>
    </div>
  );
}
