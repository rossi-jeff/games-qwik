import { component$ } from "@builder.io/qwik";
import type { CodeBreakerCode } from "../../types/code-breaker-code.type";

export interface CodeBreakerSolutionProps {
  codes: CodeBreakerCode[];
}

export const CodeBreakerSolution = component$<CodeBreakerSolutionProps>(
  (props) => {
    const { codes } = props;
    return (
      <div class="my-2">
        <h1>Solution</h1>
        <div class="code-breaker-solution px-2">
          {codes.map((c) => (
            <div key={c.id} class={c.Color}></div>
          ))}
        </div>
      </div>
    );
  }
);
