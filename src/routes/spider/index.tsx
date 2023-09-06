import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div>
      Spider works.
      <div>
        <Link href="/spider/scores">Top Scores</Link>
      </div>
    </div>
  );
});
