import { component$ } from "@builder.io/qwik";
import { type CodeBreakerGuess as CBG } from "~/types/code-breaker-guess.type";

export interface CodeBreakerGuessProps {
  guess: CBG;
}

export const CodeBreakerGuess = component$<CodeBreakerGuessProps>((props) => {
  const { guess } = props;
  return (
    <div class="flex flex-wrap mb-2">
      <div class="code-breaker-guess-colors">
        {guess.colors &&
          guess.colors.map((color) => (
            <div key={color.id} class={color.Color}></div>
          ))}
      </div>
      <div class="code-breaker-guess-keys">
        {guess.keys &&
          guess.keys.map((key) => <div key={key.id} class={key.Key}></div>)}
      </div>
    </div>
  );
});
