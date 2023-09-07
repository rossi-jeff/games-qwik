import {
	type QwikChangeEvent,
	component$,
	useSignal,
	useStore,
	$,
} from '@builder.io/qwik'
import type { PointType } from '../../types/point-type.type'
import { ShipTypeLength } from '../../enum/ship-type.enum'

export interface SeaBattlePlacementGridProps {
	axes: { Horizontal: string[]; Vertical: number[] }
	toPlace: string[]
}

export const SeaBattlePlacementGrid = component$<SeaBattlePlacementGridProps>(
	(props) => {
		const { axes, toPlace } = props
		const directions = ['S', 'E', 'W', 'N']
		const points = useSignal<PointType[]>([])
		const occupied = useSignal<PointType[]>([])
		const startAt = useStore<{
			Horizontal: string
			Vertical: number
			direction: string
			ship: string
		}>({
			ship: toPlace[0],
			Horizontal: axes.Horizontal[0],
			Vertical: axes.Vertical[0],
			direction: directions[0],
		})
		const errors = useSignal<string[]>([])

		const clearHighLight = $(() => {
			if (points.value.length == 0) return
			for (const p of points.value) {
				const el = document.getElementById(`PLC-${p.Vertical}-${p.Horizontal}`)
				if (el) el.classList.remove('highlight')
			}
		})

		const highLightShip = $(async () => {
			await clearHighLight()
			points.value = []
			errors.value = []
			const size = ShipTypeLength[startAt.ship]
			let idxH = axes.Horizontal.indexOf(startAt.Horizontal)
			let idxV = axes.Vertical.indexOf(startAt.Vertical)
			while (points.value.length < size && errors.value.length == 0) {
				if (idxH < 0 || idxH >= axes.Horizontal.length) {
					errors.value.push('Ship crosses horizontal boundary')
					break
				}
				if (idxV < 0 || idxV >= axes.Vertical.length) {
					errors.value.push('Ship crosses vertical boundary')
				}
				const point: PointType = {
					Horizontal: axes.Horizontal[idxH],
					Vertical: axes.Vertical[idxV],
				}
				const found = occupied.value.find(
					(p) =>
						p.Horizontal == point.Horizontal && p.Vertical == point.Vertical
				)
				if (found) {
					errors.value.push('Ship crosses previously placed ship')
				}
				points.value.push(point)
				switch (startAt.direction) {
					case 'N':
						idxV--
						break
					case 'S':
						idxV++
						break
					case 'E':
						idxH++
						break
					case 'W':
						idxH--
						break
				}
			}
			for (const p of points.value) {
				const el = document.getElementById(`PLC-${p.Vertical}-${p.Horizontal}`)
				if (el) el.classList.add('highlight')
			}
		})

		const shipChanged = $((e: QwikChangeEvent<HTMLSelectElement>) => {
			startAt.ship = e.target.value
			highLightShip()
		})

		const horizontalChanged = $((e: QwikChangeEvent<HTMLSelectElement>) => {
			startAt.Horizontal = e.target.value
			highLightShip()
		})

		const verticalChanged = $((e: QwikChangeEvent<HTMLSelectElement>) => {
			startAt.Vertical = parseInt(e.target.value)
			highLightShip()
		})

		const directionChanged = $((e: QwikChangeEvent<HTMLSelectElement>) => {
			startAt.direction = e.target.value
			highLightShip()
		})

		return (
			<div class="flex flex-wrap">
				<div>
					<div class="sea-battle-placement-grid">
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
									<div
										key={hi}
										id={'PLC-' + v + '-' + h}
										class="grid-cell"
									></div>
								))}
							</div>
						))}
					</div>
				</div>
				<div>
					<div>
						<label for="ship">Ship</label>
						<select name="ship" onChange$={shipChanged}>
							{toPlace.map((s, i) => (
								<option key={i} value={s}>
									{s}
								</option>
							))}
						</select>
					</div>
					<div>
						<label for="Horizontal">Horizontal</label>
						<select name="Horizontal" onChange$={horizontalChanged}>
							{axes.Horizontal.map((h, i) => (
								<option key={i} value={h}>
									{h}
								</option>
							))}
						</select>
					</div>
					<div>
						<label for="Vertical">Vertical</label>
						<select name="Vertical" onChange$={verticalChanged}>
							{axes.Vertical.map((v, i) => (
								<option key={i} value={v}>
									{v.toString()}
								</option>
							))}
						</select>
					</div>
					<div>
						<label for="direction">Direction</label>
						<select name="direction" onChange$={directionChanged}>
							{directions.map((d, i) => (
								<option key={i} value={d}>
									{d}
								</option>
							))}
						</select>
					</div>
					<div>
						{errors.value.length == 0 && <button>Place Ship</button>}
						{errors.value.length > 0 && (
							<ul>
								{errors.value.map((e, i) => (
									<li key={i}>{e}</li>
								))}
							</ul>
						)}
					</div>
				</div>
			</div>
		)
	}
)
