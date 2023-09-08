import {
  type QRL,
  component$,
  useStore,
  $,
  type QwikChangeEvent,
} from "@builder.io/qwik";

export type HangManOptionsType = {
  Min: number;
  Max: number;
};

export interface HangManOptionsProps {
  newHangMan: QRL<(options: HangManOptionsType) => void>;
}

export const HangManOptions = component$<HangManOptionsProps>((props) => {
  const state = useStore<HangManOptionsType>({
    Min: 6,
    Max: 12,
  });
  const lengths = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  const lengthChanged = $((e: QwikChangeEvent<HTMLSelectElement>) => {
    switch (e.target.name) {
      case "Min":
        state.Min = parseInt(e.target.value);
        if (state.Min > state.Max) {
          state.Max = state.Min;
        }
        break;
      case "Max":
        state.Max = parseInt(e.target.value);
        if (state.Max < state.Min) {
          state.Min = state.Max;
        }
        break;
    }
  });

  const newGame = $(() => {
    props.newHangMan(state);
  });

  return (
    <div class="flex flex-wrap">
      <div class="mr-4">
        <label for="Min" class="mr-2">
          Min
        </label>
        <select name="Min" onChange$={lengthChanged}>
          {lengths.map((l, i) => (
            <option key={i} value={l} selected={l == state.Min}>
              {l.toString()}
            </option>
          ))}
        </select>
      </div>
      <div class="mr-4">
        <label for="Max" class="mr-2">
          Max
        </label>
        <select name="Max" onChange$={lengthChanged}>
          {lengths.map((l, i) => (
            <option key={i} value={l} selected={l == state.Max}>
              {l.toString()}
            </option>
          ))}
        </select>
      </div>
      <button onClick$={newGame}>New Game</button>
    </div>
  );
});
