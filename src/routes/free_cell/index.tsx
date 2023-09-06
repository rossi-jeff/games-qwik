import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div>
      Free Cell works.
      <div>
        <Link href="/free_cell/scores">Top Scores</Link>
      </div>
    </div>
  );
});
