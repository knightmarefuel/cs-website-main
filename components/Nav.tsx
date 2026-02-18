import Link from "next/link";

export default function Nav() {
  return (
    <header className="nav">
      <div className="navInner">
        <Link href="/" className="brand" aria-label="Vitamin F3 Home">
          <div className="logoMark" />
          <div>
            <div>Vitamin F3 Portal</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
              Communities • Booking • Payments
            </div>
          </div>
        </Link>

        <nav className="navLinks">
          <Link className="pill" href="/dashboard">Dashboard</Link>
          <Link className="pill" href="/admin">Admin</Link>
          <Link className="pill" href="/auth/sign-in">Sign in</Link>
          <Link className="pill pillPrimary" href="/auth/sign-up">Sign up</Link>
        </nav>
      </div>
    </header>
  );
}
