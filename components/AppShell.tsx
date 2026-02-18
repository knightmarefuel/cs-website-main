"use client";

import Nav from "./Nav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Nav />
      <main>{children}</main>
      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-text">
            © {new Date().getFullYear()} Vitamin F3. All rights reserved.
          </span>
          <div className="footer-links">
            <a href="mailto:support@vitaminf3.com">Contact</a>
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
