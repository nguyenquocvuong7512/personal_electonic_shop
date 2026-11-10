import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Website bán hàng",
  description: "Website bán hàng online",
};

// Layout gốc của toàn bộ ứng dụng
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}