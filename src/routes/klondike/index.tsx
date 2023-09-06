import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div>
      Klondike works.
      <div>
        <Link href="/klondike/scores">Top Scores</Link>
      </div>
    </div>
  );
});
