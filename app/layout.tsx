import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Vitamin F3 – Community Fitness Portal",
  description: "Book fitness classes, submit payments, and manage your wellness journey with your gated community."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
