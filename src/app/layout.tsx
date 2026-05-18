import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CET-4 听力专项训练",
  description: "英语四级听力训练系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
