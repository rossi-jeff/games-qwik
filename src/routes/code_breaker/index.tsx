import { component$, useSignal, $ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { CodeBreakerGuessForm } from "~/components/code-breaker-guess-form/code-breaker-guess-form";
import { CodeBreakerGuessList } from "~/components/code-breaker-guess-list/code-breaker-guess-list";
import {
  type CodeBreakerGameOptions,
  CodeBreakerOptions,
} from "~/components/code-breaker-options/code-breaker-options";
import { RestClient } from "~/lib/rest-client";
import type { CodeBreaker } from "~/types/code-breaker.type";

export default component$(() => {
  const game = useSignal<CodeBreaker>({});
  const columns = useSignal(4);
  const available = useSignal<string[]>([]);

  const reloadGame = $(async () => {
    const client = new RestClient();
    const req = await client.get({ path: `api/code_breaker/${game.value.id}` });
    if (req.ok) {
      game.value = await req.json();
      console.log(game.value);
    }
  });

  const newGame = $(async (selected: CodeBreakerGameOptions) => {
    const { Colors, Columns } = selected;
    columns.value = Columns;
    available.value = Colors;
    const client = new RestClient();
    const req = await client.post({
      path: "api/code_breaker",
      payload: { Colors, Columns },
    });
    if (req.ok) {
      game.value = await req.json();
      console.log(game.value);
    }
  });

  const sendGuess = $(async (Colors: string[]) => {
    console.log(Colors);
    const client = new RestClient();
    const req = await client.post({
      path: `api/code_breaker/${game.value.id}/guess`,
      payload: { Colors },
    });
    if (req.ok) {
      const res = await req.json();
      console.log(res);
      reloadGame();
    }
  });

  return (
    <div>
      {game.value.guesses && game.value.guesses.length > 0 && (
        <CodeBreakerGuessList guesses={game.value.guesses} />
      )}
      {game.value.Status == "Playing" && (
        <CodeBreakerGuessForm
          columns={columns.value}
          available={available.value}
          sendGuess={sendGuess}
        />
      )}
      {game.value.Status != "Playing" && (
        <CodeBreakerOptions newCodeBreaker={newGame} />
      )}
      <div>
        <Link href="/code_breaker/scores">Top Scores</Link>
      </div>
    </div>
  );
});
