export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="badge">⚡ Fast booking • Community-first</div>
        <h1 className="h1">Vitamin F3 Community Fitness Portal</h1>
        <p className="sub">
          Join sessions in your gated community, book classes in seconds, and submit payment proof
          securely — all without calls and WhatsApp back-and-forth.
        </p>

        <div className="btnRow">
          <a className="pill pillPrimary" href="/auth/sign-up">Create account</a>
          <a className="pill" href="/auth/sign-in">Sign in</a>
          <a className="pill" href="/dashboard">View dashboard</a>
        </div>
      </section>

      <section className="grid">
        <div className="card cardSpan6">
          <h3 className="cardTitle">For Clients</h3>
          <p className="cardDesc">
            Choose your community, see available sessions, and reserve your spot. Upload UPI proof
            to keep payments tracked and approved by admin.
          </p>
        </div>

        <div className="card cardSpan6">
          <h3 className="cardTitle">For Admin</h3>
          <p className="cardDesc">
            Manage communities, class types, session schedules, and payment approvals — all in one place.
          </p>
        </div>

        <div className="card cardSpan4">
          <h3 className="cardTitle">Less Manual Work</h3>
          <p className="cardDesc">Reduce calls/WhatsApp dependency with a structured booking flow.</p>
        </div>

        <div className="card cardSpan4">
          <h3 className="cardTitle">Community Filtering</h3>
          <p className="cardDesc">Users see sessions based on where they live — faster decisions.</p>
        </div>

        <div className="card cardSpan4">
          <h3 className="cardTitle">Audit Trail</h3>
          <p className="cardDesc">Bookings + payments are stored cleanly for future reporting.</p>
        </div>
      </section>
    </>
  );
}
