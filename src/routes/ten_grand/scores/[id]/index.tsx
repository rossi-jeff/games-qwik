import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import { TenGrandScoreCard } from "~/components/ten-grand-score-card/ten-grand-score-card";
import { RestClient } from "~/lib/rest-client";
import type { TenGrand } from "~/types/ten-grand.type";

export default component$(() => {
  const game = useSignal<TenGrand>({});
  const loc = useLocation();

  useTask$(async () => {
    const client = new RestClient();
    const req = await client.get({ path: `api/ten_grand/${loc.params.id}` });
    if (req.ok) game.value = await req.json();
  });
  return (
    <div>
      {game.value.turns && <TenGrandScoreCard tenGrand={game.value} />}
      <div>
        <Link href="/ten_grand/scores">Top Scores</Link>
      </div>
    </div>
  );
});