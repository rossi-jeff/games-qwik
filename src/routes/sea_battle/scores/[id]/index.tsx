import { component$, useSignal, useStore, useTask$, $ } from '@builder.io/qwik'
import { DocumentHead, Link, useLocation } from '@builder.io/qwik-city'
import type { SeaBattle } from '../../../../types/sea-battle.type'
import type { SeaBattleShip } from '../../../../types/sea-batte-ship.type'
import type { SeaBattleTurn } from '../../../../types/sea-battle-turn.type'
import { RestClient } from '../../../../lib/rest-client'
import { Navy } from '../../../../enum/navy.enum'
import { SeaBattlePlayerGrid } from '../../../../components/sea-battle-player-grid/sea-battle-player-grid'
import { SeaBattleOpponentGrid } from '../../../../components/sea-battle-opponent-grid/sea-battle-opponent-grid'

export default component$(() => {
	const game = useSignal<SeaBattle>({})
	const alphabet = 'abcdefghijklmnopqrstuvwxyz'
	const playerShips = useSignal<SeaBattleShip[]>([])
	const playerTurns = useSignal<SeaBattleTurn[]>([])
	const opponentShips = useSignal<SeaBattleShip[]>([])
	const opponentTurns = useSignal<SeaBattleTurn[]>([])
	const gridAxes = useStore<{ Horizontal: string[]; Vertical: number[] }>({
		Horizontal: [],
		Vertical: [],
	})
	const loc = useLocation()

	const noop = $(() => {})

	useTask$(async () => {
		const client = new RestClient()
		const req = await client.get({ path: `api/sea_battle/${loc.params.id}` })
		if (req.ok) {
			game.value = await req.json()
			if (game.value.ships) {
				playerShips.value = game.value.ships.filter(
					(s) => s.Navy == Navy.Player
				)
				opponentShips.value = game.value.ships.filter(
					(s) => s.Navy == Navy.Opponent
				)
			}
			if (game.value.turns) {
				playerTurns.value = game.value.turns.filter(
					(t) => t.Navy == Navy.Player
				)
				opponentTurns.value = game.value.turns.filter(
					(t) => t.Navy == Navy.Opponent
				)
			}
			const current = game.value.Axis || 0
			gridAxes.Horizontal = []
			gridAxes.Vertical = []
			const letters = alphabet.toUpperCase().split('')
			for (let i = 0; i < current; i++) {
				gridAxes.Horizontal.push(letters[i])
				gridAxes.Vertical.push(i + 1)
			}
		}
	})
	return (
		<div>
			{gridAxes.Horizontal.length > 0 &&
				gridAxes.Vertical.length > 0 &&
				game.value.id != undefined && (
					<div>
						<SeaBattlePlayerGrid
							axes={gridAxes}
							playerFire={noop}
							fired={true}
							opponentTurn={noop}
							controls={false}
							ships={opponentShips.value}
							turns={playerTurns.value}
						/>
						<SeaBattleOpponentGrid
							axes={gridAxes}
							fired={true}
							playerTurn={noop}
							opponentFire={noop}
							controls={false}
							ships={playerShips.value}
							turns={opponentTurns.value}
						/>
					</div>
				)}
			<div>
				<Link href="/sea_battle/scores">Top Scores</Link>
			</div>
		</div>
	)
})

export const head: DocumentHead = {
	title: 'Games by Jeff Rossi | Sea Battle',
	meta: [
		{
			name: 'description',
			content: 'Games by Jeff Rossi',
		},
	],
}
