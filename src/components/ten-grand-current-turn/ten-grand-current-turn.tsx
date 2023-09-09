import {
	type QRL,
	component$,
	useSignal,
	useVisibleTask$,
	$,
	type QwikDragEvent,
} from '@builder.io/qwik'
import type { TenGrand } from '../../types/ten-grand.type'
import type { TenGrandTurn } from '../../types/ten-grand-turn.type'
import type { TenGrandOption } from '../../types/ten-grand-option.type'
import { TenGrandScoreOptionList } from '../ten-grand-score-option-list/ten-grand-score-option-list'
import { TenGrandTurnDisplay } from '../ten-grand-turn-display/ten-grand-turn-display'
import { RestClient } from '../../lib/rest-client'
import { DieDisplayLg } from '../die-display-lg/die-display-lg'

export interface TenGrandCurrentTurnProps {
	tenGrand: TenGrand
	reloadGame: QRL<() => void>
}

export const TenGrandCurrentTurn = component$<TenGrandCurrentTurnProps>(
	(props) => {
		const game = useSignal<TenGrand>({})
		const turn = useSignal<TenGrandTurn>({})
		const options = useSignal<TenGrandOption[]>([])
		const rollDice = useSignal<number[]>([])
		const scoreDice = useSignal<number[]>([])
		const dragging = useSignal('')

		const roll = $(async () => {
			if (!game.value.id) return
			const Quantity = rollDice.value.length || 6
			const client = new RestClient()
			const req = await client.post({
				path: `api/ten_grand/${game.value.id}/roll`,
				payload: { Quantity },
			})
			if (req.ok) rollDice.value = await req.json()
		})

		const scoreOptions = $(() => {})

		const dragStart = $(
			(_: QwikDragEvent<HTMLDivElement>, target: HTMLDivElement) => {
				dragging.value = target.id
			}
		)

		const drop = $(
			(_: QwikDragEvent<HTMLDivElement>, target: HTMLDivElement) => {
				target.classList.remove('over')
				const [from, idx] = dragging.value.split('_')
				// const [from, idx] = data.split('_')
				const to = target.id
				console.log('drop', from, idx, to)
				if (from == to) return
				let value: number
				const sd = JSON.parse(JSON.stringify(scoreDice.value))
				const rd = JSON.parse(JSON.stringify(rollDice.value))
				switch (from) {
					case 'roll-dice':
						value = rd[parseInt(idx)]
						rd.splice(parseInt(idx), 1)
						sd.push(value)
						break
					case 'score-dice':
						value = sd[parseInt(idx)]
						sd.splice(parseInt(idx), 1)
						rd.push(value)
						break
				}
				scoreDice.value = sd
				rollDice.value = rd
			}
		)

		useVisibleTask$(async ({ track }) => {
			game.value = track(() => props.tenGrand)
			const rd = track(() => rollDice.value)
			const sd = track(() => scoreDice.value)
			if (sd.length > 0 || rd.length > 0) {
				const Dice = [...sd]
				const client = new RestClient()
				const req = await client.post({
					path: 'api/ten_grand/options',
					payload: { Dice },
				})
				if (req.ok) {
					const { Options } = await req.json()
					options.value = Options
				}
			}
			if (sd.length == 0 && rd.length == 0) {
				turn.value = {}
				props.reloadGame()
			}
		})
		return (
			<div class="ten-grand-current-turn">
				<div class="flex flex-wrap justify-between">
					<div>
						<strong>Turns</strong>
						{game.value.turns ? game.value.turns.length : 0}
					</div>
					<div>
						<strong>Status</strong>
						{game.value.Status}
					</div>
					<div>
						<strong>Score</strong>
						{game.value.Score || 0}
					</div>
				</div>
				<div class="flex flex-wrap">
					<div
						id="roll-dice"
						class="ten-grand-dice-container mr-2"
						onDrop$={drop}
						preventdefault:dragover
					>
						{rollDice.value.map((f, i) => (
							<DieDisplayLg
								key={i}
								face={f}
								index={i}
								from="roll-dice"
								draggable={true}
								dragStart={dragStart}
							/>
						))}
					</div>
					<div
						id="score-dice"
						class="ten-grand-dice-container"
						onDrop$={drop}
						preventdefault:dragover
					>
						{scoreDice.value.map((f, i) => (
							<DieDisplayLg
								key={i}
								face={f}
								index={i}
								from="score-dice"
								draggable={true}
								dragStart={dragStart}
							/>
						))}
					</div>
				</div>
				{options.value.length > 0 ? (
					<TenGrandScoreOptionList
						options={options.value}
						scoreOptions={scoreOptions}
					/>
				) : (
					<button onClick$={roll}>Roll</button>
				)}
				{turn.value.scores && <TenGrandTurnDisplay turn={turn.value} />}
			</div>
		)
	}
)
