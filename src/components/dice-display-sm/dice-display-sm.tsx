import { component$ } from "@builder.io/qwik";

export interface DiceDisplaySmProps {
  face: number;
}

export const DiceDisplaySm = component$<DiceDisplaySmProps>((props) => {
  const { face } = props;
  return (
    <div class="dice-display-sm" draggable={false}>
      <img
        src={"/dice/dice-" + face + ".svg"}
        alt={"Die " + face}
        width="20"
        height="20"
        class="die-sm"
        draggable={false}
      />
    </div>
  );
});
