import { type QRL, component$, $ } from "@builder.io/qwik";

export interface SeaBattleOpponentGridProps {
  axes: { Horizontal: string[]; Vertical: number[] };
  fired: boolean;
  opponentFire: QRL<() => void>;
  playerTurn: QRL<() => void>;
}

export const SeaBattleOpponentGrid = component$<SeaBattleOpponentGridProps>(
  (props) => {
    const { axes, fired } = props;

    const opponentFire = $(() => {
      props.opponentFire();
    });

    const playerTurn = $(() => {
      props.playerTurn();
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
                  <div key={hi} id={"O-" + v + "-" + h} class="grid-cell">
                    <span></span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div>
          {fired ? (
            <button onClick$={playerTurn}>Player Turn</button>
          ) : (
            <button onClick$={opponentFire}>Fire</button>
          )}
        </div>
      </div>
    );
  }
);
