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
  title: "Host | Bahoot",
  description: "Host your own quiz game with Bahoot, the new educational tool for teachers.",
  openGraph: {
    title: "Host a game",
    description: "Host your quiz game for people to join and play.",
    images: [
      {
        url: "/favicon.png",
        width: 128,
        height: 128,
        alt: "Bahoot logo",
      },
    ],
  },
  icons: {
    icon: "https://hda-breakfast.vercel.app/icon.png",
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${inter.variable} ${robotoMono.variable} antialiased`}>
      {children}
    </div>
  );
}
