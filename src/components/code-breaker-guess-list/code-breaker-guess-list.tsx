import { component$ } from "@builder.io/qwik";
import type { CodeBreakerGuess as CBG } from "~/types/code-breaker-guess.type";
import { CodeBreakerGuess } from "../code-breaker-guess/code-breaker-guess";

export interface CodeBreakerGuessListProps {
  guesses: CBG[];
}

export const CodeBreakerGuessList = component$<CodeBreakerGuessListProps>(
  (props) => {
    const { guesses } = props;
    return (
      <div>
        {guesses.map((guess) => (
          <CodeBreakerGuess key={guess.id} guess={guess} />
        ))}
      </div>
    );
  }
);
