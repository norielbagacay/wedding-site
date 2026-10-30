import type { Metadata } from "next";
import { coupleNamesOf } from "../content";
import { getWedding } from "../lib/supabase";
import { SnapCamera } from "./SnapCamera";
import styles from "./Snap.module.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Snap & Share | ${coupleNamesOf(await getWedding())}`,
    description: "Capture a little magic from our wedding day. Take a photo, choose a filter, and save your memory.",
    alternates: { canonical: "/snap" },
  };
}

export default async function SnapPage() {
  const wedding = await getWedding();
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        {/* <Link href="/" className={styles.back}>Back to our invitation</Link> */}
        <h1 className={styles.srOnly}>Snap &amp; Share</h1>
        <SnapCamera hashtags={wedding.hashtags} names={coupleNamesOf(wedding)} />
        <footer className={styles.footer}>
          <p>Save your photo, then share it with our wedding hashtags.</p>
          <ul aria-label="Our wedding hashtags">
            {wedding.hashtags.map((hashtag) => <li key={hashtag}>{hashtag}</li>)}
          </ul>
        </footer>
      </div>
    </main>
  );
}
