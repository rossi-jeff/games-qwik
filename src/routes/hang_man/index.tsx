import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div>
      Hang Man works.
      <div>
        <Link href="/hang_man/scores">Top Scores</Link>
      </div>
    </div>
  );
});
