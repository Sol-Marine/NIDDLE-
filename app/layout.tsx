import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NIDDLE | Fast Bicycle Delivery in Lagos",
  description:
    "Same-day bicycle delivery across Lagos. Fast, reliable, and eco-friendly package delivery in your city.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
