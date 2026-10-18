import { Details } from "./components/Details";
import { MusicBox } from "./components/MusicBox";
import { coupleNames, month } from "./content";

export default function Home() {
  return (
    <main>
      <MusicBox names={coupleNames} heroMonth={month}>
        <Details />
      </MusicBox>
    </main>
  );
}
