import { component$ } from "@builder.io/qwik";
import type { TenGrand } from "../../types/ten-grand.type";
import { TenGrandTurnDisplay } from "../ten-grand-turn-display/ten-grand-turn-display";

export interface TenGrandScoreCardProps {
  tenGrand: TenGrand;
}

export const TenGrandScoreCard = component$<TenGrandScoreCardProps>((props) => {
  const { tenGrand } = props;
  return (
    <div class="ten-grand-score-card">
      <div class="flex flex-wrap justify-between px-2">
        <div>
          <strong class="mr-2">Status</strong>
          {tenGrand.Status}
        </div>
        <div>
          <strong class="mr-2">Score</strong>
          {tenGrand.Score}
        </div>
      </div>
      <div class="max-h-96 overflow-y-auto">
        {tenGrand.turns &&
          tenGrand.turns.map((turn) => (
            <TenGrandTurnDisplay key={turn.id} turn={turn} />
          ))}
      </div>
    </div>
  );
});
