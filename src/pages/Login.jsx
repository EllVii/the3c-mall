function Login() {
  return (
    <section className="page center narrow">
      <h1>Welcome back to your 3C Mall</h1>
      <p className="page-subtitle">
        Log in to see your meal plans, grocery breakdowns, and rewards.
      </p>

      <form className="card form">
        <label>
          Email
          <input type="email" placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input type="password" placeholder="••••••••" />
        </label>
        <button type="submit" className="primary-btn full-width">
          Log In
        </button>
        <p className="muted small">
          Accounts aren&apos;t wired up yet. This is your starter UI — we’ll
          connect the backend later.
        </p>
      </form>
    </section>
  );
}

export default Login;
