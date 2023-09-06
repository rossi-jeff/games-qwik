import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div>
      Yacht works.
      <div>
        <Link href="/yacht/scores">Top Scores</Link>
      </div>
    </div>
  );
});
