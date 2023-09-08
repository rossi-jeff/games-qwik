import { component$ } from "@builder.io/qwik";

export interface HangManSolutionProps {
  word: string;
}

export const HangManSolution = component$<HangManSolutionProps>((props) => {
  const { word } = props;
  return (
    <div>
      The correct word was <b>{word.toUpperCase()}</b>
    </div>
  );
});
