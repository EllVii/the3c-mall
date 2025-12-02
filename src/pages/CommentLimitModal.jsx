import "../styles/CommentLimitModal.css";
// src/pages/CommentLimitModal.jsx

export default function CommentLimitModal() {
  return (
    <section className="page modal-page">
      <div className="modal-card">
        <h1>Comment Limit Reached</h1>
        <p>
          You've used your 3 comments for this month.
          Upgrade to unlock unlimited community access.
        </p>

        <div className="modal-actions">
          <a className="btn-primary" href="/pricing">Upgrade Now</a>
          <a className="btn-ghost" href="/">Back Home</a>
        </div>
      </div>
    </section>
  );
}
