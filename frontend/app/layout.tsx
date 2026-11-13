import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sublimer — Make every clip count",
  description: "Turn raw video clips into upload-ready content in minutes.",
  icons: {
    icon: "/sublime_logo_icon.png",
  },
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
