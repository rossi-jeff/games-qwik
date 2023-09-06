import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div>
      Guess Word works.
      <div>
        <Link href="/guess_word/scores">Top Scores</Link>
      </div>
    </div>
  );
});
