import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Welcome Itz Fizz — Scroll-Driven Hero",
  description:
    "A scroll-driven hero animation built with Next.js, GSAP ScrollTrigger and an original SVG vehicle.",
};

export const viewport: Viewport = {
  themeColor: "#05070f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="bg-night-950 min-h-full">
        {/*
          Safety net for the CSS flash guard in globals.css: with JS disabled the
          animated layers are never revealed by GSAP, so force them visible.
        */}
        <noscript>
          <style>{`[data-headline],[data-letter],[data-stat],[data-vehicle]{opacity:1 !important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
