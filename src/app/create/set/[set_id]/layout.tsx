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
  keywords: [
    "Bahoot",
    "quiz",
    "game",
    "education",
    "teacher",
    "students",
    "interactive",
    "learning",
    "fun",
    "engaging",
    "quiz game",
    "create quiz",
    "educational tool",
    "teacher tool",
    "student engagement",
    "interactive learning",
    "quiz maker",
    "classroom tool",
    "learning tool",
    "quiz platform",
    "educational platform",
    "teacher resources",
    "student resources",
    "quiz creation",
    "classroom engagement",
    "interactive quiz",
    "learning games",
    "educational games",
    "teacher quiz",
    "student quiz",
    "quiz competition",
    "classroom quiz",
    "quiz challenge",
    "learning activities",
    "teacher activities",
    "student activities",
    "quiz fun",
    "interactive activities",
    "educational activities",
    "quiz education",
    "teacher engagement",
    "student engagement",
    "quiz learning",
    "interactive education",
    "teacher quiz game",
  ],
  description:
    "Create a quiz set for your students with Bahoot.",
  openGraph: {
    title: "Bahoot | The new educational tool for teachers",
    description:
      "Bahoot is the new revolutionary tool for teachers to create quiz games for students to enjoy.",
    images: [
      {
        url: "https://hda-breakfast.vercel.app/icon.png",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    ><head>
        <meta charSet="UTF-8" />
        <title>Edit set | Bahoot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0  " />
              <meta name="msapplication-TileColor" content="#8eff61" />
        <meta name="theme-color" content="#8eff61" />
        <meta name="application-name" content="Bahoot" />
        <meta name="apple-mobile-web-app-title" content="Bahoot" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        </head>
      <body>{children}</body>
    </html>
  );
}
