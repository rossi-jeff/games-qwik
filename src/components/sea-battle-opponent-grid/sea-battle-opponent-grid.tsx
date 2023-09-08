import { type QRL, component$, $, useVisibleTask$ } from '@builder.io/qwik'
import type { SeaBattleShip } from '../../types/sea-batte-ship.type'
import type { SeaBattleTurn } from '../../types/sea-battle-turn.type'
import { isServer } from '@builder.io/qwik/build'

export interface SeaBattleOpponentGridProps {
	axes: { Horizontal: string[]; Vertical: number[] }
	fired: boolean
	opponentFire: QRL<() => void>
	playerTurn: QRL<() => void>
	controls: boolean
	ships: SeaBattleShip[]
	turns: SeaBattleTurn[]
}

export const SeaBattleOpponentGrid = component$<SeaBattleOpponentGridProps>(
	(props) => {
		const { axes, fired, controls } = props

		const opponentFire = $(() => {
			props.opponentFire()
		})

		const playerTurn = $(() => {
			props.playerTurn()
		})

		useVisibleTask$(({ track }) => {
			const ships = track(() => props.ships)
			const turns = track(() => props.turns)
			if (isServer) {
				return // Server guard
			}
			for (const ship of ships) {
				if (ship.points) {
					for (const point of ship.points) {
						const el = document.getElementById(
							`O-${point.Vertical}-${point.Horizontal}`
						)
						if (el) el.classList.add('occupied')
					}
				}
			}
			for (const turn of turns) {
				const el = document.getElementById(
					`O-${turn.Vertical}-${turn.Horizontal}`
				)
				if (el) el.classList.add(String(turn.Target))
			}
		})
		return (
			<div>
				<h1>Opponent</h1>
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
										<div key={hi} id={'O-' + v + '-' + h} class="grid-cell">
											<span></span>
										</div>
									))}
								</div>
							))}
						</div>
					</div>
					{controls && (
						<div>
							{fired ? (
								<button onClick$={playerTurn}>Player Turn</button>
							) : (
								<button onClick$={opponentFire} disabled={fired}>
									Fire
								</button>
							)}
						</div>
					)}
				</div>
			</div>
		)
	}
)
