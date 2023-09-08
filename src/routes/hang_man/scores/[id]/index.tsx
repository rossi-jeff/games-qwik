import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import { HangManDrawing } from "~/components/hang-man-drawing/hang-man-drawing";
import { HangManSolution } from "~/components/hang-man-solution/hang-man-solution";
import { HangManWordDisplay } from "~/components/hang-man-word-display/hang-man-word-display";
import { RestClient } from "~/lib/rest-client";
import type { HangMan } from "~/types/hang-man.type";
import type { Word } from "~/types/word.type";

export default component$(() => {
  const game = useSignal<HangMan>({});
  const word = useSignal<Word>({});
  const loc = useLocation();

  useTask$(async () => {
    const client = new RestClient();
    const req = await client.get({ path: `api/hang_man/${loc.params.id}` });
    if (req.ok) {
      game.value = await req.json();
      if (game.value.word) word.value = game.value.word;
    }
  });
  return (
    <div>
      {game.value.id && <HangManDrawing wrong={game.value.Wrong || ""} />}
      {word.value.Word && (
        <>
          <HangManWordDisplay
            word={word.value.Word}
            correct={game.value.Correct || ""}
          />
          <HangManSolution word={word.value.Word} />
        </>
      )}
      <div>
        <Link href="/hang_man/scores">Top Scores</Link>
      </div>
    </div>
  );
});
