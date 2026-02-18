import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Vitamin F3 – Portal",
  description: "Community-based class booking & management"
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
