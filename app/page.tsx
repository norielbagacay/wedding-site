import { Details } from "./components/Details";
import { MusicBox } from "./components/MusicBox";
import { coupleNames } from "./content";

export default function Home() {
  return (
    <main>
      <MusicBox names={coupleNames}>
        <Details />
      </MusicBox>
    </main>
  );
}
