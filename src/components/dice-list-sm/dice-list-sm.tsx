import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import { DiceDisplaySm } from "../dice-display-sm/dice-display-sm";

export interface DiceListSmProps {
  dice: string;
}

export const DiceListSm = component$<DiceListSmProps>((props) => {
  const faces = useSignal<number[]>([]);

  useTask$(({ track }) => {
    const f: number[] = [];
    const dice = track(() => props.dice);
    for (const d of dice.split(",")) f.push(parseInt(d));
    faces.value = f;
  });
  return (
    <div class="flex w-48">
      {faces.value.map((face, i) => (
        <DiceDisplaySm key={i} face={face} />
      ))}
    </div>
  );
});
