import { component$, useSignal, useTask$, $ } from "@builder.io/qwik";
import type { Yacht } from "../../../types/yacht.type";
import { RestClient } from "../../../lib/rest-client";
import { PaginationControls } from "~/components/pagination-controls/pagination-controls";

export default component$(() => {
  const path = "api/yacht";
  const count = useSignal(0);
  const limit = useSignal(10);
  const offset = useSignal(0);
  const items = useSignal<Yacht[]>([]);

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
      <h1>Yacht Scores</h1>
      <div class="score-list">
        <div class="score-header">
          <div class="cell-48-left">User</div>
          <div class="cell-20-right">Score</div>
        </div>
        {items.value.map((y) => (
          <div key={y.id} class="score-row">
            <div class="cell-48-left">
              {y.user ? y.user.UserName : "Anonymous"}
            </div>
            <div class="cell-20-right">{y.Total}</div>
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
