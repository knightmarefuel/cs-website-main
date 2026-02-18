import Link from "next/link";
import AppShell from "@/components/AppShell";

export default function Home() {
  return (
    <AppShell>
      <div className="container">
        <section className="hero">
          <div className="hero-badge" data-testid="hero-badge">
            Community-First Fitness
          </div>
          <h1 className="hero-title" data-testid="hero-title">
            Vitamin F3 Portal
          </h1>
          <p className="hero-subtitle">
            Join fitness sessions in your gated community, book classes in seconds, 
            and submit payment proof securely — all without calls and WhatsApp back-and-forth.
          </p>
          <div className="hero-actions">
            <Link href="/auth/sign-up" className="btn btn-solid btn-lg" data-testid="cta-signup">
              Get Started
            </Link>
            <Link href="/auth/sign-in" className="btn btn-lg" data-testid="cta-signin">
              Sign In
            </Link>
          </div>
        </section>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3 className="feature-title">Easy Booking</h3>
            <p className="feature-description">
              Browse available sessions filtered by your community and book your spot instantly. 
              See real-time capacity and never miss a class.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3 className="feature-title">Payment Tracking</h3>
            <p className="feature-description">
              Upload UPI payment screenshots and track approval status. 
              No more manual coordination — everything is organized.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏘️</div>
            <h3 className="feature-title">Community Focused</h3>
            <p className="feature-description">
              Sessions are organized by gated community. See only what's relevant 
              to you and connect with neighbors who share your fitness goals.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👨‍💼</div>
            <h3 className="feature-title">Admin Dashboard</h3>
            <p className="feature-description">
              Trainers and admins can manage communities, schedule sessions, 
              and review payments — all from a unified dashboard.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Audit Trail</h3>
            <p className="feature-description">
              Every booking and payment is recorded cleanly. Generate reports 
              and maintain transparency with your members.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3 className="feature-title">Mobile Ready</h3>
            <p className="feature-description">
              Access the portal from any device. Book sessions and upload 
              payment proofs right from your phone.
            </p>
          </div>
        </div>

        <div style={{ marginTop: 64, textAlign: "center" }}>
          <div className="card card-gold" style={{ display: "inline-block", maxWidth: 480 }}>
            <h3 style={{ marginBottom: 8 }}>Ready to get fit?</h3>
            <p className="text-muted" style={{ marginBottom: 16 }}>
              Join your community's fitness program today.
            </p>
            <Link href="/auth/sign-up" className="btn btn-primary">
              Create Your Account
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
