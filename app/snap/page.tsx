import type { Metadata } from "next";
import { coupleNames, wedding } from "../content";
import { SnapCamera } from "./SnapCamera";
import styles from "./Snap.module.css";

export const metadata: Metadata = {
  title: `Snap & Share | ${coupleNames}`,
  description: "Capture a little magic from our wedding day. Take a photo, choose a filter, and save your memory.",
  alternates: { canonical: "/snap" },
};

export default function SnapPage() {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        {/* <Link href="/" className={styles.back}>Back to our invitation</Link> */}
        <h1 className={styles.srOnly}>Snap &amp; Share</h1>
        <SnapCamera />
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