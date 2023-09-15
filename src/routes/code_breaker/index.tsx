import {
	component$,
	useSignal,
	$,
	useStore,
	useVisibleTask$,
} from '@builder.io/qwik'
import { Link } from '@builder.io/qwik-city'
import { CodeBreakerGuessForm } from '~/components/code-breaker-guess-form/code-breaker-guess-form'
import { CodeBreakerGuessList } from '~/components/code-breaker-guess-list/code-breaker-guess-list'
import {
	type CodeBreakerGameOptions,
	CodeBreakerOptions,
} from '~/components/code-breaker-options/code-breaker-options'
import { RestClient } from '~/lib/rest-client'
import type { CodeBreaker } from '~/types/code-breaker.type'
import { CodeBreakerSolution } from '../../components/code-breaker-solution/code-breaker-solution'
import {
	type SessionData,
	blankSession,
	sessionKey,
} from '../../types/session-data.type'
import { GameStatus } from '../../enum/game-status.enum'

export default component$(() => {
	const game = useSignal<CodeBreaker>({})
	const columns = useSignal(4)
	const available = useSignal<string[]>([])
	const sesssion = useStore<SessionData>(blankSession)
	const headers = useSignal<{ [key: string]: string }>({})
	const inProgress = useSignal<CodeBreaker[]>([])

	const loadInProgress = $(async () => {
		const client = new RestClient()
		const req = await client.get({
			path: 'api/code_breaker/progress',
			headers: headers.value,
		})
		if (req.ok) inProgress.value = await req.json()
	})

	const reloadGame = $(async () => {
		const client = new RestClient()
		const req = await client.get({ path: `api/code_breaker/${game.value.id}` })
		if (req.ok) {
			game.value = await req.json()
			if (game.value.Columns) columns.value = game.value.Columns
			if (game.value.Available)
				available.value = game.value.Available.split(',')
			if (game.value.Status != GameStatus.Playing && sesssion.SignedIn)
				loadInProgress()
		}
	})

	const newGame = $(async (selected: CodeBreakerGameOptions) => {
		const { Colors, Columns } = selected
		columns.value = Columns
		available.value = Colors
		const client = new RestClient()
		const req = await client.post({
			path: 'api/code_breaker',
			payload: { Colors, Columns },
			headers: headers.value,
		})
		if (req.ok) {
			game.value = await req.json()
			console.log(game.value)
		}
	})

	const sendGuess = $(async (Colors: string[]) => {
		console.log(Colors)
		const client = new RestClient()
		const req = await client.post({
			path: `api/code_breaker/${game.value.id}/guess`,
			payload: { Colors },
		})
		if (req.ok) {
			const res = await req.json()
			console.log(res)
			reloadGame()
		}
	})

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
			{game.value.guesses && game.value.guesses.length > 0 && (
				<CodeBreakerGuessList guesses={game.value.guesses} />
			)}
			{game.value.Status == 'Lost' && (
				<CodeBreakerSolution codes={game.value.codes || []} />
			)}
			{game.value.Status == 'Playing' && (
				<CodeBreakerGuessForm
					columns={columns.value}
					available={available.value}
					sendGuess={sendGuess}
				/>
			)}
			{game.value.Status != 'Playing' && (
				<CodeBreakerOptions newCodeBreaker={newGame} />
			)}
			{game.value.Status != 'Playing' && inProgress.value.length > 0 && (
				<div class="mt-2">
					<div class="score-header">
						<div class="cell-10-left"></div>
						<div class="cell-20-center">Status</div>
						<div class="cell-20-center">Score</div>
						<div class="cell-20-center">Colors</div>
						<div class="cell-20-right">Columns</div>
					</div>
					{inProgress.value.map((cb) => (
						<div key={cb.id} class="score-row">
							<div class="cell-10-left">
								<button onClick$={() => continueGame(cb.id || 0)}>
									Continue
								</button>
							</div>
							<div class="cell-20-center">{cb.Status}</div>
							<div class="cell-20-center">{cb.Score}</div>
							<div class="cell-20-center">{cb.Colors}</div>
							<div class="cell-20-right">{cb.Columns}</div>
						</div>
					))}
				</div>
			)}
			<div>
				<Link href="/code_breaker/scores">Top Scores</Link>
			</div>
		</div>
	)
})
