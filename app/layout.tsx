import type { Metadata } from "next";
import { Cormorant_Garamond, Great_Vibes } from "next/font/google";
import { coupleNames, wedding } from "./content";
import "./globals.css";

const script = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: "400",
});

const serif = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const title = `${coupleNames} · Wedding Invitation`;
const description = `You're invited to celebrate the wedding of ${coupleNames} on ${wedding.date.display}.`;

export const metadata: Metadata = {
  metadataBase: new URL(wedding.siteUrl),
  title,
  description,
  openGraph: { title, description, type: "website", images: ["/bg.jpg"] },
  twitter: { card: "summary_large_image", title, description, images: ["/bg.jpg"] },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${script.variable} ${serif.variable} antialiased`}>
      <body className="bg-cream font-serif text-lg text-taupe">{children}</body>
    </html>
  );
}
