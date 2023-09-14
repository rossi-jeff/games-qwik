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

export default component$(() => {
	const game = useSignal<CodeBreaker>({})
	const columns = useSignal(4)
	const available = useSignal<string[]>([])
	const sesssion = useStore<SessionData>(blankSession)
	const headers = useSignal<{ [key: string]: string }>({})

	const reloadGame = $(async () => {
		const client = new RestClient()
		const req = await client.get({ path: `api/code_breaker/${game.value.id}` })
		if (req.ok) {
			game.value = await req.json()
			console.log(game.value)
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
			<div>
				<Link href="/code_breaker/scores">Top Scores</Link>
			</div>
		</div>
	)
})
