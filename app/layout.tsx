import type { Metadata } from "next";
import { Cormorant_Garamond, Great_Vibes } from "next/font/google";
import { coupleNamesOf } from "./content";
import { getWedding } from "./lib/supabase";
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

export async function generateMetadata(): Promise<Metadata> {
  const wedding = await getWedding();
  const coupleNames = coupleNamesOf(wedding);
  const title = `${coupleNames} · Wedding Invitation`;
  const description = `You're invited to celebrate the wedding of ${coupleNames} on ${wedding.date.display}.`;
  return {
    metadataBase: new URL(wedding.siteUrl),
    title,
    description,
    openGraph: { title, description, type: "website", images: ["/music-box.jpg"] },
    twitter: { card: "summary_large_image", title, description, images: ["/music-box.jpg"] },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${script.variable} ${serif.variable} antialiased`}>
      <body className="bg-cream font-serif text-lg text-taupe">{children}</body>
    </html>
  );
}
