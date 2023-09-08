import {
  component$,
  useStore,
  $,
  type QwikChangeEvent,
  useSignal,
  type QRL,
} from "@builder.io/qwik";
import type { PointType } from "~/types/point-type.type";

export interface SeaBattlePlayerGridProps {
  axes: { Horizontal: string[]; Vertical: number[] };
  playerFire: QRL<(point: PointType) => void>;
  fired: boolean;
  opponentTurn: QRL<() => void>;
}

export const SeaBattlePlayerGrid = component$<SeaBattlePlayerGridProps>(
  (props) => {
    const { axes, fired } = props;
    const target = useStore<{
      Horizontal: string;
      Vertical: number;
    }>({
      Horizontal: axes.Horizontal[0],
      Vertical: axes.Vertical[0],
    });
    const errors = useSignal<string[]>([]);
    const occupied = useSignal<PointType[]>([]);

    const clearHighLight = $(() => {
      const el = document.getElementById(
        `P-${target.Vertical}-${target.Horizontal}`
      );
      if (el) el.classList.remove("highlight");
    });

    const highLightTarget = $(() => {
      const found = occupied.value.find(
        (p) =>
          p.Horizontal == target.Horizontal && p.Vertical == target.Vertical
      );
      if (!found) {
        const el = document.getElementById(
          `P-${target.Vertical}-${target.Horizontal}`
        );
        if (el) el.classList.add("highlight");
        errors.value = [];
      } else {
        errors.value.push("You cannot fire at a previous grid point");
      }
    });

    const horizontalChanged = $(
      async (e: QwikChangeEvent<HTMLSelectElement>) => {
        await clearHighLight();
        target.Horizontal = e.target.value;
        highLightTarget();
      }
    );

    const verticalChanged = $(async (e: QwikChangeEvent<HTMLSelectElement>) => {
      await clearHighLight();
      target.Vertical = parseInt(e.target.value);
      highLightTarget();
    });

    const playerFire = $(() => {
      props.playerFire(target);
    });

    const opponentTurn = $(() => {
      props.opponentTurn();
    });

    return (
      <div class="flex flex-wrap">
        <div class="mr-4">
          <div class="sea-battle-grid">
            <div class="grid-row">
              <div class="grid-header-cell"></div>
              {axes.Horizontal.map((h, i) => (
                <div key={i} class="grid-header-cell">
                  {h}
                </div>
              ))}
            </div>
            {axes.Vertical.map((v, vi) => (
              <div key={vi} class="grid-row">
                <div class="grid-header-cell">{v.toString()}</div>
                {axes.Horizontal.map((h, hi) => (
                  <div key={hi} id={"P-" + v + "-" + h} class="grid-cell">
                    <span></span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div>
          {fired == false && (
            <div>
              <div>
                <label for="Horizontal">Horizontal</label>
                <select name="Horizontal" onChange$={horizontalChanged}>
                  {axes.Horizontal.map((h, i) => (
                    <option key={i} value={h} selected={h == target.Horizontal}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label for="Vertical">Vertical</label>
                <select name="Vertical" onChange$={verticalChanged}>
                  {axes.Vertical.map((v, i) => (
                    <option key={i} value={v} selected={v == target.Vertical}>
                      {v.toString()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                {errors.value.length == 0 && (
                  <button onClick$={playerFire}>Fire</button>
                )}
                {errors.value.length > 0 && (
                  <ul>
                    {errors.value.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          {fired && (
            <div>
              <button onClick$={opponentTurn}>Opponent Turn</button>
            </div>
          )}
        </div>
      </div>
    );
  }
);
