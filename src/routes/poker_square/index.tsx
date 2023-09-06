import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div>
      Poker Square works.
      <div>
        <Link href="/poker_square/scores">Top Scores</Link>
      </div>
    </div>
  );
});
