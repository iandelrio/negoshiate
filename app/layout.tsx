import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Negoshiate",
  description: "Practice high-stakes conversations with an AI voice agent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
