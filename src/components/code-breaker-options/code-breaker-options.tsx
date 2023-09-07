import {
  component$,
  useStore,
  $,
  type QwikChangeEvent,
  type QRL,
} from "@builder.io/qwik";
import { ColorArray } from "~/enum/color.enum";

export type CodeBreakerGameOptions = {
  Columns: number;
  Colors: string[];
};

export interface CodeBreakerOptionsProps {
  newCodeBreaker: QRL<(selected: CodeBreakerGameOptions) => void>;
}

export const CodeBreakerOptions = component$<CodeBreakerOptionsProps>(
  (props) => {
    const selected = useStore<CodeBreakerGameOptions>({
      Columns: 4,
      Colors: [],
    });
    const columns = [4, 5, 6, 7, 8];

    const colorChecked = $((e: QwikChangeEvent<HTMLInputElement>) => {
      const color = e.target.value;
      const idx = selected.Colors.indexOf(color);
      if (idx == -1) {
        selected.Colors.push(color);
      } else {
        selected.Colors.splice(idx, 1);
      }
    });

    const columnsChanged = $((e: QwikChangeEvent<HTMLSelectElement>) => {
      selected.Columns = parseInt(e.target.value);
    });

    const checkAll = $(() => {
      selected.Colors = [];
      for (const color of ColorArray) {
        selected.Colors.push(color);
      }
    });

    const newGame = $(() => {
      if (selected.Colors.length < 3) return;
      props.newCodeBreaker(selected);
    });
    return (
      <div class="flex flex-wrap justify-between">
        <div class="code-breaker-color-options">
          <div class="White">
            <button onClick$={checkAll}>Check All</button>
          </div>
          {ColorArray.map((name) => (
            <div key={name} class={name}>
              <input
                type="checkbox"
                value={name}
                checked={selected.Colors.includes(name)}
                onChange$={colorChecked}
              />
              <label class="ml-1">{name}</label>
            </div>
          ))}
        </div>
        <div>
          <label for="columns">Columns</label>
          <select
            name="columns"
            value={selected.Columns}
            onChange$={columnsChanged}
          >
            {columns.map((c) => (
              <option key={c} value={c}>
                {c.toString()}
              </option>
            ))}
          </select>
        </div>
        <button onClick$={newGame}>New Game</button>
      </div>
    );
  }
);
