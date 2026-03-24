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

        <section style={{ marginTop: 72 }}>
          <div className="card" style={{ padding: "32px", maxWidth: "100%" }}>
            <div className="hero-badge" style={{ marginBottom: 16 }}>
              About FrecTaa
            </div>
            <h2 style={{ fontSize: "2rem", marginBottom: 20 }}>Fun Fitness Forever</h2>

            <div style={{ display: "grid", gap: 20 }}>
              <p className="feature-description" style={{ fontSize: "1rem", lineHeight: 1.8 }}>
                FrecTaa is a registered fitness format developed by Vitamin F3, created with one clear purpose — to make fitness safe, enjoyable, and sustainable for everyone. Designed with safety at its core, FrecTaa routines are carefully structured to suit all age groups, fitness levels, and lifestyle backgrounds, making movement accessible without intimidation.
              </p>

              <p className="feature-description" style={{ fontSize: "1rem", lineHeight: 1.8 }}>
                Built on the philosophy of <strong>Fun Fitness Forever</strong>, FrecTaa transforms the way people experience exercise by combining engagement, energy, and structured training into one holistic fitness approach. Rather than focusing on short-term trends, our programs are designed to help individuals build long-lasting fitness habits that naturally fit into everyday life.
              </p>

              <p className="feature-description" style={{ fontSize: "1rem", lineHeight: 1.8 }}>
                FrecTaa offers a diverse range of fitness experiences including dance fitness, yoga, pilates, strength training, flexibility work, sports-based conditioning, and functional movement practices. Each format is curated by experts to ensure balanced development of strength, endurance, mobility, coordination, and overall well-being.
              </p>

              <p className="feature-description" style={{ fontSize: "1rem", lineHeight: 1.8 }}>
                What makes FrecTaa unique is its holistic and results-focused methodology. Every session is thoughtfully designed to support physical health, mental freshness, and lifestyle improvement while maintaining high levels of participation and enjoyment. Participants experience fitness as something they look forward to rather than something they struggle to sustain.
              </p>

              <p className="feature-description" style={{ fontSize: "1rem", lineHeight: 1.8 }}>
                Over time, individuals and groups engaging with FrecTaa have experienced noticeable improvements in energy levels, confidence, consistency, and overall health. The seamless blend of structured fitness and enjoyable movement creates an environment where transformation happens naturally — making fitness not just an activity, but a way of life.
              </p>
            </div>
          </div>
        </section>

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
