import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

export interface HangManWordDisplayProps {
  word: string;
  correct: string;
}

export const HangManWordDisplay = component$<HangManWordDisplayProps>(
  (props) => {
    const letters = useSignal<string[]>([]);

    useVisibleTask$(({ track }) => {
      const word = track(() => props.word);
      const correct = track(() => props.correct);
      letters.value = new Array(word.length).fill("");

      for (const letter of correct.split(",")) {
        if (letter) {
          for (let i = 0; i < word.length; i++) {
            if (word[i].toLowerCase() == letter.toLowerCase()) {
              letters.value[i] = letter;
            }
          }
        }
      }
    });
    return (
      <div class="flex flex-wrap">
        {letters.value.map((l, i) => (
          <div key={i} class="hang-man-display-letter">
            {l}
          </div>
        ))}
      </div>
    );
  }
);
