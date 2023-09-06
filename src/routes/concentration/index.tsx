import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div>
      Concentration works.
      <div>
        <Link href="/concentration/scores">Top Scores</Link>
      </div>
    </div>
  );
});
