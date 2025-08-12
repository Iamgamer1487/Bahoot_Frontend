import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Podium | Bahoot",
  description:
    "",
  openGraph: {
    title: "Bahoot | The new educational tool for teachers",
    description:
      "Bahoot is the new revolutionary tool for teachers to create quiz games for students to enjoy.",
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
    icon: "https://hda-breakfast.vercel.app/icon.png", // nextjs injects favicon automatically
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
