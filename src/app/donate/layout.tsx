import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Donate | Bahoot",
  description: "Bahoot is the new revolutionary tool for teachers to create quiz games. Being fun, engaging, and educational, students will definitely enjoy Bahoot.",
    openGraph: {
    title: "Bahoot | The new educational tool for teachers",
    description: "Bahoot is the new revolutionary tool for teachers to create quiz games for students to enjoy.",
    images: [
      {
        url: "https://hda-breakfast.vercel.app/icon.png",
        width: 128,
        height: 128,
        alt: "Bahoot logo",
      }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
           <head>
        <link rel="icon" href="https://hda-breakfast.vercel.app/icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
