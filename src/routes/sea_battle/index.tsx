import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div>
      Sea Battle works.
      <div>
        <Link href="/sea_battle/scores">Top Scores</Link>
      </div>
    </div>
  );
});
