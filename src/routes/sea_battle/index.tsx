import { component$, useSignal, $, useStore } from '@builder.io/qwik'
import { Link } from '@builder.io/qwik-city'
import type { SeaBattle } from '../../types/sea-battle.type'
import {
	SeaBattleOptions,
	type SeaBattleGameOptions,
} from '../../components/sea-battle-options/sea-battle-options'
import { RestClient } from '../../lib/rest-client'
import { Navy } from '../../enum/navy.enum'

export default component$(() => {
	const game = useSignal<SeaBattle>({})
	const toPlace = useSignal<string[]>([])
	const axis = useSignal(8)
	const navy = useSignal<Navy>(Navy.Player)
	const gridAxes = useStore<{ Horizontal: string[]; Vertical: number[] }>({
		Horizontal: [],
		Vertical: [],
	})
	const alphabet = 'abcdefghijklmnopqrstuvwxyz'

	const buildGridAxes = $((axis: number) => {
		gridAxes.Horizontal = []
		gridAxes.Vertical = []
		const letters = alphabet.toUpperCase().split('')
		for (let i = 0; i < axis; i++) {
			gridAxes.Horizontal.push(letters[i])
			gridAxes.Vertical.push(i + 1)
		}
	})

	const newSeaBattle = $(async (options: SeaBattleGameOptions) => {
		const { Axis, ships } = options
		axis.value = Axis
		await buildGridAxes(Axis)
		toPlace.value = []
		for (const key in ships) {
			for (let i = 0; i < ships[key]; i++) toPlace.value.push(key)
		}
		const client = new RestClient()
		const req = await client.post({ path: 'api/sea_battle', payload: { Axis } })
		if (req.ok) {
			game.value = await req.json()
		}
	})

	return (
		<div>
			{game.value.Status != 'Playing' && (
				<SeaBattleOptions newSeaBattle={newSeaBattle} />
			)}
			<div>
				<Link href="/sea_battle/scores">Top Scores</Link>
			</div>
			<div>{navy.value}</div>
		</div>
	)
})
