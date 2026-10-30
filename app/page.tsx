import { Details } from "./components/Details";
import { MusicBox } from "./components/MusicBox";
import { coupleNamesOf, monthOf } from "./content";
import { getWedding } from "./lib/supabase";

export default async function Home() {
  const wedding = await getWedding();
  return (
    <main>
      <MusicBox names={coupleNamesOf(wedding)} heroMonth={monthOf(wedding)}>
        <Details wedding={wedding} />
      </MusicBox>
    </main>
  );
}
