import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Play | Bahoot",
  description: "Play a quiz game hosted by someone else.",
  openGraph: {
    title: "Play a game",
    description: "Join a quiz game hosted by someone else on Bahoot.",
    images: [
      {
        url: "/favicon.png",
        width: 128,
        height: 128,
        alt: "Bahoot logo",
      },
    ],
  },
};

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.variable} ${robotoMono.variable} antialiased`}>
      {children}
    </div>
  );
}
