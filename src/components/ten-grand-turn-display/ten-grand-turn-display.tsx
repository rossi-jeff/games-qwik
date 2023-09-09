import { component$ } from "@builder.io/qwik";
import type { TenGrandTurn } from "../../types/ten-grand-turn.type";
import { DiceListSm } from "../dice-list-sm/dice-list-sm";

export interface TenGrandTurnDisplayProps {
  turn: TenGrandTurn;
}

export const TenGrandTurnDisplay = component$<TenGrandTurnDisplayProps>(
  (props) => {
    const { turn } = props;
    return (
      <div class="ten-grand-turn-display">
        <div class="flex-grow">
          {turn.scores &&
            turn.scores.map((s, i) => (
              <div key={i} class="ten-grand-turn-display-row">
                <div class="w-36">{s.Category}</div>
                <DiceListSm dice={s.Dice || ""} />
                <div class="w-10 text-right">{s.Score}</div>
              </div>
            ))}
        </div>
        <div class="w-20 text-right">{turn.Score}</div>
      </div>
    );
  }
);
