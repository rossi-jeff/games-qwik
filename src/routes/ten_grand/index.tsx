import {
	component$,
	useSignal,
	$,
	useVisibleTask$,
	useStore,
} from '@builder.io/qwik'
import type { TenGrand } from '../../types/ten-grand.type'
import { GameStatus } from '../../enum/game-status.enum'
import { TenGrandCurrentTurn } from '../../components/ten-grand-current-turn/ten-grand-current-turn'
import { TenGrandScoreCard } from '../../components/ten-grand-score-card/ten-grand-score-card'
import { RestClient } from '../../lib/rest-client'
import { Link } from '@builder.io/qwik-city'
import {
	type SessionData,
	blankSession,
	sessionKey,
} from '../../types/session-data.type'

export default component$(() => {
	const game = useSignal<TenGrand>({})
	const sesssion = useStore<SessionData>(blankSession)
	const headers = useSignal<{ [key: string]: string }>({})

	const newGame = $(async () => {
		const client = new RestClient()
		const req = await client.post({
			path: 'api/ten_grand',
			payload: {},
			headers: headers.value,
		})
		if (req.ok) game.value = await req.json()
	})

	const reloadGame = $(async () => {
		if (!game.value.id) return
		const client = new RestClient()
		const req = await client.get({ path: `api/ten_grand/${game.value.id}` })
		if (req.ok) game.value = await req.json()
	})

	useVisibleTask$(async () => {
		const stored = sessionStorage.getItem(sessionKey)
		if (stored) {
			const data: SessionData = JSON.parse(stored)
			sesssion.Token = data.Token
			sesssion.UserName = data.UserName
			sesssion.SignedIn = true
			headers.value = { Authorization: `Bearer ${data.Token}` }
		}
	})
	return (
		<div>
			{game.value.Status == GameStatus.Playing && (
				<TenGrandCurrentTurn tenGrand={game.value} reloadGame={reloadGame} />
			)}
			{game.value.Status != GameStatus.Playing && (
				<button onClick$={newGame}>New Game</button>
			)}
			{game.value.turns && <TenGrandScoreCard tenGrand={game.value} />}
			<div>
				<Link href="/ten_grand/scores">Top Scores</Link>
			</div>
		</div>
	)
})
