import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <div>
      Code Breaker works.
      <div>
        <Link href="/code_breaker/scores">Top Scores</Link>
      </div>
    </div>
  );
});
