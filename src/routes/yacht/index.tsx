import {
	component$,
	useSignal,
	$,
	useStore,
	useVisibleTask$,
} from '@builder.io/qwik'
import { Link } from '@builder.io/qwik-city'
import { YachtScoreCard } from '~/components/yacht-score-card/yacht-score-card'
import { YachtScoreOptionsList } from '~/components/yacht-score-options-list/yacht-score-options-list'
import { YachtTurnDisplay } from '~/components/yacht-turn-display/yacht-turn-display'
import type { YachtCategory } from '~/enum/yacht-category.enum'
import { RestClient } from '~/lib/rest-client'
import type { YachtScoreOption } from '~/types/yacht-score-option.type'
import type { YachtTurn } from '~/types/yacht-turn.type'
import type { Yacht } from '~/types/yacht.type'
import {
	type SessionData,
	blankSession,
	sessionKey,
} from '../../types/session-data.type'

export default component$(() => {
	const game = useSignal<Yacht>({})
	const turn = useSignal<YachtTurn>({})
	const options = useSignal<YachtScoreOption[]>([])
	const flags = useStore({
		rollTwo: false,
		rollThree: false,
	})
	const sesssion = useStore<SessionData>(blankSession)
	const headers = useSignal<{ [key: string]: string }>({})
	const inProgress = useSignal<Yacht[]>([])

	const loadInProgress = $(async () => {
		const client = new RestClient()
		const req = await client.get({
			path: 'api/yacht/progress',
			headers: headers.value,
		})
		if (req.ok) inProgress.value = await req.json()
	})

	const newGame = $(async () => {
		const client = new RestClient()
		const req = await client.post({
			path: 'api/yacht',
			payload: {},
			headers: headers.value,
		})
		if (req.ok) game.value = await req.json()
		console.log(game.value)
	})

	const reloadGame = $(async () => {
		if (!game.value.id) return
		const client = new RestClient()
		const req = await client.get({ path: `api/yacht/${game.value.id}` })
		if (req.ok) {
			game.value = await req.json()
			if (game.value.NumTurns == 12) loadInProgress()
		}
	})

	const roll = $(async (Keep: number[]) => {
		if (!game.value.id) return
		const client = new RestClient()
		const req = await client.post({
			path: `api/yacht/${game.value.id}/roll`,
			payload: { Keep },
		})
		if (req.ok) {
			const { Turn, Options } = await req.json()
			turn.value = Turn
			options.value = Options
			console.log({ Turn, Options })
		}
	})

	const firstRoll = $(() => {
		roll([])
	})

	const secondRoll = $((Keep: number[]) => {
		flags.rollTwo = true
		roll(Keep)
	})

	const thirdRoll = $((Keep: number[]) => {
		flags.rollThree = true
		roll(Keep)
	})

	const scoreTurn = $(async (Category: YachtCategory) => {
		if (!game.value.id) return
		const TurnId = turn.value.id || 0
		const client = new RestClient()
		const req = await client.post({
			path: `api/yacht/${game.value.id}/score`,
			payload: { TurnId, Category },
		})
		if (req.ok) {
			turn.value = {}
			options.value = []
			flags.rollTwo = false
			flags.rollThree = false
			reloadGame()
		}
	})

	const noop = $(() => {})

	const continueGame = $((id: number) => {
		game.value = { id }
		reloadGame()
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
			{game.value.NumTurns != undefined && game.value.NumTurns < 12 ? (
				<div>
					{turn.value.RollOne ? (
						<YachtTurnDisplay
							heading="First Roll"
							roll={turn.value.RollOne}
							btnLabel="Roll Two"
							rollDice={secondRoll}
							disabled={flags.rollTwo}
						/>
					) : (
						<button onClick$={firstRoll} class="my-2">
							First Roll
						</button>
					)}
					{turn.value.RollTwo && (
						<YachtTurnDisplay
							heading="Second Roll"
							roll={turn.value.RollTwo}
							btnLabel="Roll Three"
							rollDice={thirdRoll}
							disabled={flags.rollThree}
						/>
					)}
					{turn.value.RollThree && (
						<YachtTurnDisplay
							heading="Third Roll"
							roll={turn.value.RollThree}
							btnLabel=""
							rollDice={noop}
							disabled={true}
						/>
					)}
					{options.value.length > 0 && (
						<YachtScoreOptionsList
							options={options.value}
							scoreTurn={scoreTurn}
						/>
					)}
				</div>
			) : (
				<button onClick$={newGame}>New Game</button>
			)}
			{game.value.turns && game.value.turns.length > 0 && (
				<YachtScoreCard
					total={game.value.Total || 0}
					turns={game.value.turns}
				/>
			)}
			{(game.value.NumTurns == undefined || game.value.NumTurns == 12) &&
				inProgress.value.length > 0 && (
					<div class="mt-2">
						<div class="score-header">
							<div class="cell-10-left"></div>
							<div class="cell-20-center">Turns</div>
							<div class="cell-20-right">Score</div>
						</div>
						{inProgress.value.map((y) => (
							<div key={y.id} class="score-row">
								<div class="cell-10-left">
									<button onClick$={() => continueGame(y.id || 0)}>
										Continue
									</button>
								</div>
								<div class="cell-20-center">{y.NumTurns}</div>
								<div class="cell-20-right">{y.Total}</div>
							</div>
						))}
					</div>
				)}
			<div>
				<Link href="/yacht/scores">Top Scores</Link>
			</div>
		</div>
	)
})
