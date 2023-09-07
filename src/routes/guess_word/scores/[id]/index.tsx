import { component$, useSignal, useTask$ } from '@builder.io/qwik'
import { Link, useLocation } from '@builder.io/qwik-city'
import type { GuessWord } from '../../../../types/guess-word.type'
import { GuessWordGuessList } from '../../../../components/guess-word-guess-list/guess-word-guess-list'
import { GuessWordSolution } from '../../../../components/guess-word-solution/guess-word-solution'
import { RestClient } from '../../../../lib/rest-client'

export default component$(() => {
	const game = useSignal<GuessWord>({})
	const loc = useLocation()
	useTask$(async () => {
		const client = new RestClient()
		const req = await client.get({ path: `api/guess_word/${loc.params.id}` })
		if (req.ok) game.value = await req.json()
	})
	return (
		<div>
			{game.value.guesses && (
				<GuessWordGuessList guesses={game.value.guesses} />
			)}
			{game.value.word && game.value.word.Word && (
				<GuessWordSolution word={game.value.word.Word} />
			)}
			<div>
				<Link href="/guess_word/scores">Top Scores</Link>
			</div>
		</div>
	)
})
