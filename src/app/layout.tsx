import type { Metadata } from "next";
import { Noto_Serif_SC, ZCOOL_XiaoWei } from "next/font/google";
import "./globals.css";

const song = Noto_Serif_SC({
  subsets: ["latin"],
  variable: "--font-cifu-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const title = ZCOOL_XiaoWei({
  subsets: ["latin"],
  variable: "--font-cifu-serif",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "赐福模拟器",
    template: "%s · 召唤兽工具",
  },
  description: "梦幻西游召唤兽赐福与进阶模拟",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${song.variable} ${title.variable}`}>{children}</body>
    </html>
  );
}
