import { component$, useVisibleTask$ } from '@builder.io/qwik'
import type { SeaBattleShip } from '../../types/sea-batte-ship.type'

export interface SeaBattleShipDisplayProps {
	ship: SeaBattleShip
}

export const SeaBattleShipDisplay = component$<SeaBattleShipDisplayProps>(
	(props) => {
		const { ship } = props
		useVisibleTask$(({ track }) => {
			const points = track(() => ship.points)
			const hits = track(() => ship.hits)
			if (points && hits) {
				for (const p of points) {
					for (const h of hits) {
						if (p.Horizontal == h.Horizontal && p.Vertical == h.Vertical) {
							const el = document.getElementById(`ship-point-${p.id}`)
							if (el) el.classList.add('Hit')
						}
					}
				}
			}
		})
		return (
			<div class="sea-battle-ship-display">
				{ship.points && (
					<div class="sea-battle-ship-graphic">
						{ship.points.map((p) => (
							<div
								key={p.id}
								class="sea-battle-ship-point"
								id={'ship-point-' + p.id}
							>
								<span></span>
							</div>
						))}
					</div>
				)}
				<div class="font-bold text-center">{ship.Type}</div>
			</div>
		)
	}
)
