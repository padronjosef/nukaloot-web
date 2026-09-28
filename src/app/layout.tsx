import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nuka Loot",
  description: "Find the best prices for any video game across multiple stores",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    // Extensions edit <html> and <body> before React hydrates — Dark Reader
    // adds data-darkreader-proxy-injected, password managers add their own —
    // and React then reports a mismatch nobody can fix from here. This
    // silences that one comparison, on these two elements only and one level
    // deep: a real mismatch anywhere inside the app is still reported.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} dark h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground"
      >
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
