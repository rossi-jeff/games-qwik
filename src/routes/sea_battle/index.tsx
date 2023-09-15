import {
	component$,
	useSignal,
	$,
	useStore,
	useTask$,
	useVisibleTask$,
} from '@builder.io/qwik'
import { Link } from '@builder.io/qwik-city'
import type { SeaBattle } from '../../types/sea-battle.type'
import {
	SeaBattleOptions,
	type SeaBattleGameOptions,
} from '../../components/sea-battle-options/sea-battle-options'
import { RestClient } from '../../lib/rest-client'
import { Navy } from '../../enum/navy.enum'
import { GameStatus } from '~/enum/game-status.enum'
import {
	type PlaceShipType,
	SeaBattlePlacementGrid,
} from '~/components/sea-battle-placement-grid/sea-battle-placement-grid'
import { SeaBattlePlayerGrid } from '~/components/sea-battle-player-grid/sea-battle-player-grid'
import type { PointType } from '~/types/point-type.type'
import type { SeaBattleShip } from '~/types/sea-batte-ship.type'
import type { SeaBattleTurn } from '~/types/sea-battle-turn.type'
import { SeaBattleOpponentGrid } from '~/components/sea-battle-opponent-grid/sea-battle-opponent-grid'
import {
	type SessionData,
	blankSession,
	sessionKey,
} from '../../types/session-data.type'

export default component$(() => {
	const game = useSignal<SeaBattle>({})
	const toPlace = useSignal<string[]>([])
	const axis = useSignal(0)
	const navy = useSignal<Navy>(Navy.Player)
	const fired = useSignal(false)
	const gridAxes = useStore<{ Horizontal: string[]; Vertical: number[] }>({
		Horizontal: [],
		Vertical: [],
	})
	const alphabet = 'abcdefghijklmnopqrstuvwxyz'
	const playerShips = useSignal<SeaBattleShip[]>([])
	const playerTurns = useSignal<SeaBattleTurn[]>([])
	const opponentShips = useSignal<SeaBattleShip[]>([])
	const opponentTurns = useSignal<SeaBattleTurn[]>([])
	const sesssion = useStore<SessionData>(blankSession)
	const headers = useSignal<{ [key: string]: string }>({})
	const inProgress = useSignal<SeaBattle[]>([])

	const loadInProgress = $(async () => {
		const client = new RestClient()
		const req = await client.get({
			path: 'api/sea_battle/progress',
			headers: headers.value,
		})
		if (req.ok) inProgress.value = await req.json()
	})

	const newSeaBattle = $(async (options: SeaBattleGameOptions) => {
		const { Axis, ships } = options
		axis.value = Axis
		toPlace.value = []
		for (const key in ships) {
			for (let i = 0; i < ships[key]; i++) toPlace.value.push(key)
		}
		const client = new RestClient()
		const req = await client.post({
			path: 'api/sea_battle',
			payload: { Axis },
			headers: headers.value,
		})
		if (req.ok) {
			game.value = await req.json()
		}
	})

	const reloadGame = $(async () => {
		if (!game.value.id) return
		const client = new RestClient()
		const req = await client.get({ path: `api/sea_battle/${game.value.id}` })
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
			if (game.value.Axis) axis.value = game.value.Axis
			if (game.value.Status != GameStatus.Playing && sesssion.SignedIn)
				loadInProgress()
		}
	})

	const createPlayerShip = $(
		async (ShipType: string, Size: number, Points: PointType[]) => {
			if (!game.value.id) return
			const client = new RestClient()
			const req = await client.post({
				path: `api/sea_battle/${game.value.id}/ship`,
				payload: { ShipType, Size, Points, Navy: Navy.Player },
			})
			if (req.ok) {
				reloadGame()
			}
		}
	)

	const createOpponentShip = $(async (ShipType: string, Size: number) => {
		if (!game.value.id) return
		const client = new RestClient()
		const req = await client.post({
			path: `api/sea_battle/${game.value.id}/ship`,
			payload: { ShipType, Size, Navy: Navy.Opponent },
		})
		if (req.ok) {
			reloadGame()
		}
	})

	const placeShip = $((options: PlaceShipType) => {
		const { Type, Size, Points } = options
		createPlayerShip(Type, Size, Points)
		createOpponentShip(Type, Size)
		const copy = JSON.parse(JSON.stringify(toPlace.value))
		const idx = copy.indexOf(Type)
		if (idx != -1) copy.splice(idx, 1)
		toPlace.value = copy
	})

	const playerFire = $(async (point: PointType) => {
		if (!game.value.id) return
		fired.value = true
		const { Horizontal, Vertical } = point
		const client = new RestClient()
		const req = await client.post({
			path: `api/sea_battle/${game.value.id}/fire`,
			payload: { Horizontal, Vertical, Navy: Navy.Player },
		})
		if (req.ok) {
			reloadGame()
		}
	})

	const opponentFire = $(async () => {
		if (!game.value.id) return
		fired.value = true
		const client = new RestClient()
		const req = await client.post({
			path: `api/sea_battle/${game.value.id}/fire`,
			payload: { Navy: Navy.Opponent },
		})
		if (req.ok) {
			reloadGame()
		}
	})

	const toggleTurn = $(() => {
		navy.value = navy.value == Navy.Player ? Navy.Opponent : Navy.Player
		fired.value = false
	})

	const continueGame = $((id: number) => {
		game.value = { id }
		reloadGame()
	})

	useTask$(({ track }) => {
		const current = track(() => axis.value)
		gridAxes.Horizontal = []
		gridAxes.Vertical = []
		const letters = alphabet.toUpperCase().split('')
		for (let i = 0; i < current; i++) {
			gridAxes.Horizontal.push(letters[i])
			gridAxes.Vertical.push(i + 1)
		}
	})

	useVisibleTask$(async () => {
		const stored = sessionStorage.getItem(sessionKey)
		if (stored) {
			const data: SessionData = JSON.parse(stored)
			sesssion.Token = data.Token
			sesssion.UserName = data.UserName
			sesssion.SignedIn = true
			headers.value = { Authorization: `Bearer ${data.Token}` }
			loadInProgress()
		}
	})

	return (
		<div>
			{game.value.Status == GameStatus.Playing &&
				toPlace.value.length == 0 &&
				navy.value == Navy.Opponent && (
					<SeaBattleOpponentGrid
						axes={gridAxes}
						fired={fired.value}
						playerTurn={toggleTurn}
						opponentFire={opponentFire}
						controls={true}
						ships={playerShips.value}
						turns={opponentTurns.value}
					/>
				)}
			{game.value.Status == GameStatus.Playing &&
				toPlace.value.length == 0 &&
				navy.value == Navy.Player && (
					<SeaBattlePlayerGrid
						axes={gridAxes}
						playerFire={playerFire}
						fired={fired.value}
						opponentTurn={toggleTurn}
						controls={true}
						ships={opponentShips.value}
						turns={playerTurns.value}
					/>
				)}
			{game.value.Status == GameStatus.Playing && toPlace.value.length > 0 && (
				<SeaBattlePlacementGrid
					axes={gridAxes}
					toPlace={toPlace.value}
					placeShip={placeShip}
				/>
			)}
			{game.value.Status != GameStatus.Playing && (
				<SeaBattleOptions newSeaBattle={newSeaBattle} />
			)}
			{game.value.Status != GameStatus.Playing &&
				inProgress.value.length > 0 && (
					<div>
						{inProgress.value.map((sb) => (
							<div key={sb.id} class="score-row">
								<div class="cell-10-left">
									<button onClick$={() => continueGame(sb.id || 0)}>
										Continue
									</button>
								</div>
								<div class="cell-20-center">{sb.Status}</div>
								<div class="cell-20-center">{sb.Score}</div>
								<div class="cell-20-right">{sb.Axis}</div>
							</div>
						))}
					</div>
				)}
			<div>
				<Link href="/sea_battle/scores">Top Scores</Link>
			</div>
		</div>
	)
})
