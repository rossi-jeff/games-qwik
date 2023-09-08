import {
  type QRL,
  component$,
  useVisibleTask$,
  useSignal,
  $,
} from "@builder.io/qwik";

export interface HangManLettersProps {
  correct: string;
  wrong: string;
  guessHangmanLetter: QRL<(letter: string) => void>;
}

export const HangManLetters = component$<HangManLettersProps>((props) => {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const letters = useSignal<string[]>([]);

  const sendLetter = $((letter: string) => {
    props.guessHangmanLetter(letter);
  });

  useVisibleTask$(({ track }) => {
    const correct = track(() => props.correct);
    const wrong = track(() => props.wrong);
    letters.value = alphabet.toUpperCase().split("");

    for (const letter of letters.value) {
      if (letter) {
        const el = document.getElementById(
          `letter-${letter.toUpperCase()}`
        ) as HTMLInputElement;
        el.disabled = false;
      }
    }

    for (const letter of correct.split(",")) {
      if (letter) {
        const el = document.getElementById(
          `letter-${letter.toUpperCase()}`
        ) as HTMLInputElement;
        el.classList.add("Correct");
        el.disabled = true;
      }
    }

    for (const letter of wrong.split(",")) {
      if (letter) {
        const el = document.getElementById(
          `letter-${letter.toUpperCase()}`
        ) as HTMLInputElement;
        el.classList.add("Wrong");
        el.disabled = true;
      }
    }
  });
  return (
    <div class="flex flex-wrap">
      {letters.value.map((l, i) => (
        <button
          key={i}
          id={"letter-" + l}
          class="letter"
          onClick$={() => sendLetter(l)}
        >
          {l}
        </button>
      ))}
    </div>
  );
});
