import { component$, useSignal, useTask$, $ } from "@builder.io/qwik";
import type { SeaBattle } from "../../../types/sea-battle.type";
import { RestClient } from "../../../lib/rest-client";
import { PaginationControls } from "~/components/pagination-controls/pagination-controls";

export default component$(() => {
  const path = "api/sea_battle";
  const count = useSignal(0);
  const limit = useSignal(10);
  const offset = useSignal(0);
  const items = useSignal<SeaBattle[]>([]);

  const loadData = $(
    async (path: string, params?: { [key: string]: number }) => {
      const client = new RestClient();
      const req = await client.get({ path, params });
      return await req.json();
    }
  );

  const limitChanged = $(async (l: number) => {
    limit.value = l;
    offset.value = 0;
    const params = { Limit: limit.value, Offset: offset.value };
    const data = await loadData(path, params);
    count.value = data.Count;
    limit.value = data.Limit;
    offset.value = data.Offset;
    items.value = data.Items;
  });

  const pageChanged = $(async (p: number) => {
    offset.value = (p - 1) * limit.value;
    const params = { Limit: limit.value, Offset: offset.value };
    const data = await loadData(path, params);
    count.value = data.Count;
    limit.value = data.Limit;
    offset.value = data.Offset;
    items.value = data.Items;
  });

  useTask$(async () => {
    const params = { Limit: limit.value, Offset: offset.value };
    const data = await loadData(path, params);
    count.value = data.Count;
    limit.value = data.Limit;
    offset.value = data.Offset;
    items.value = data.Items;
  });
  return (
    <div>
      <h1>Sea Battle Scores</h1>
      <div class="score-list">
        <div class="score-header">
          <div class="cell-48-left">User</div>
          <div class="cell-20-center">Status</div>
          <div class="cell-20-center">Score</div>
          <div class="cell-20-right">Axis</div>
        </div>
        {items.value.map((sb) => (
          <div key={sb.id} class="score-row">
            <div class="cell-48-left">
              {sb.user ? sb.user.UserName : "Anonymous"}
            </div>
            <div class="cell-20-center">{sb.Status}</div>
            <div class="cell-20-center">{sb.Score}</div>
            <div class="cell-20-right">{sb.Axis}</div>
          </div>
        ))}
      </div>
      <PaginationControls
        count={count.value}
        limit={limit.value}
        offset={offset.value}
        limitChanged={limitChanged}
        pageChanged={pageChanged}
      />
    </div>
  );
});
