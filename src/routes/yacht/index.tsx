import { component$, useSignal, $, useStore } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { YachtScoreCard } from "~/components/yacht-score-card/yacht-score-card";
import { YachtScoreOptionsList } from "~/components/yacht-score-options-list/yacht-score-options-list";
import { YachtTurnDisplay } from "~/components/yacht-turn-display/yacht-turn-display";
import type { YachtCategory } from "~/enum/yacht-category.enum";
import { RestClient } from "~/lib/rest-client";
import type { YachtScoreOption } from "~/types/yacht-score-option.type";
import type { YachtTurn } from "~/types/yacht-turn.type";
import type { Yacht } from "~/types/yacht.type";

export default component$(() => {
  const game = useSignal<Yacht>({});
  const turn = useSignal<YachtTurn>({});
  const options = useSignal<YachtScoreOption[]>([]);
  const flags = useStore({
    rollTwo: false,
    rollThree: false,
  });

  const newGame = $(async () => {
    const client = new RestClient();
    const req = await client.post({ path: "api/yacht", payload: {} });
    if (req.ok) game.value = await req.json();
    console.log(game.value);
  });

  const reloadGame = $(async () => {
    if (!game.value.id) return;
    const client = new RestClient();
    const req = await client.get({ path: `api/yacht/${game.value.id}` });
    if (req.ok) game.value = await req.json();
  });

  const roll = $(async (Keep: number[]) => {
    if (!game.value.id) return;
    const client = new RestClient();
    const req = await client.post({
      path: `api/yacht/${game.value.id}/roll`,
      payload: { Keep },
    });
    if (req.ok) {
      const { Turn, Options } = await req.json();
      turn.value = Turn;
      options.value = Options;
      console.log({ Turn, Options });
    }
  });

  const firstRoll = $(() => {
    roll([]);
  });

  const secondRoll = $((Keep: number[]) => {
    flags.rollTwo = true;
    roll(Keep);
  });

  const thirdRoll = $((Keep: number[]) => {
    flags.rollThree = true;
    roll(Keep);
  });

  const scoreTurn = $(async (Category: YachtCategory) => {
    if (!game.value.id) return;
    const TurnId = turn.value.id || 0;
    const client = new RestClient();
    const req = await client.post({
      path: `api/yacht/${game.value.id}/score`,
      payload: { TurnId, Category },
    });
    if (req.ok) {
      turn.value = {};
      options.value = [];
      flags.rollTwo = false;
      flags.rollThree = false;
      reloadGame();
    }
  });

  const noop = $(() => {});
  return (
    <div>
      {game.value.NumTurns != undefined && game.value.NumTurns < 12 ? (
        <div>
          {turn.value.RollOne ? (
            <YachtTurnDisplay
              heading="First Roll"
              roll={turn.value.RollOne}
              btnLabel="Roll Two"
              rollDice={secondRoll}
              disabled={flags.rollTwo}
            />
          ) : (
            <button onClick$={firstRoll}>First Roll</button>
          )}
          {turn.value.RollTwo && (
            <YachtTurnDisplay
              heading="Second Roll"
              roll={turn.value.RollTwo}
              btnLabel="Roll Three"
              rollDice={thirdRoll}
              disabled={flags.rollThree}
            />
          )}
          {turn.value.RollThree && (
            <YachtTurnDisplay
              heading="Third Roll"
              roll={turn.value.RollThree}
              btnLabel=""
              rollDice={noop}
              disabled={true}
            />
          )}
          {options.value.length > 0 && (
            <YachtScoreOptionsList
              options={options.value}
              scoreTurn={scoreTurn}
            />
          )}
        </div>
      ) : (
        <button onClick$={newGame}>New Game</button>
      )}
      {game.value.turns && game.value.turns.length > 0 && (
        <YachtScoreCard
          total={game.value.Total || 0}
          turns={game.value.turns}
        />
      )}
      <div>
        <Link href="/yacht/scores">Top Scores</Link>
      </div>
    </div>
  );
});
