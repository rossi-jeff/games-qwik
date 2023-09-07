import {
  type QRL,
  component$,
  useSignal,
  useTask$,
  $,
  type QwikChangeEvent,
} from "@builder.io/qwik";

export interface CodeBreakerGuessFormProps {
  columns: number;
  available: string[];
  sendGuess: QRL<(colors: string[]) => void>;
}

export const CodeBreakerGuessForm = component$<CodeBreakerGuessFormProps>(
  (props) => {
    const { columns, available } = props;
    const colors = useSignal<string[]>([]);

    const setColor = $((e: QwikChangeEvent<HTMLSelectElement>) => {
      const idx = parseInt(e.target.name.split("-").pop() || "-1");
      const color = e.target.value;
      if (idx != -1) colors.value[idx] = color;
    });

    const guessReady = $(() => {
      for (const color of colors.value) {
        if (color == "") return false;
      }
      return true;
    });

    const sendGuess = $(async () => {
      const ready = await guessReady();
      if (!ready) return;
      props.sendGuess(colors.value);
    });

    useTask$(async () => {
      colors.value = new Array(columns).fill("");
    });
    return (
      <div class="flex flex-wrap justify-between">
        <div class="flex flex-wrap">
          {colors.value.map((color, i) => (
            <div key={i} class="mr-4">
              <select name={"color-" + i} value={color} onChange$={setColor}>
                <option value="">-- select --</option>
                {available.map((c, i) => (
                  <option key={i} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div>
          <button onClick$={sendGuess}>Send Guess</button>
        </div>
      </div>
    );
  }
);
