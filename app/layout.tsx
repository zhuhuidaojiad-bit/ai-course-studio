import type { ReactNode } from "react";
import type { Metadata } from "next";

import "@/app/globals.css";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "AI 兴趣班学习中心",
  description: "AI 兴趣班的课程入口、学习区与课堂功能中心。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="page-frame">
          <div className="aurora aurora-one" />
          <div className="aurora aurora-two" />
          <Header />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
