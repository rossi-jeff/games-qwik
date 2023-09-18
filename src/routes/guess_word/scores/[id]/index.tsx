import { component$, useSignal, useTask$ } from '@builder.io/qwik'
import {
	type DocumentHead,
	Link,
	useLocation,
	type StaticGenerateHandler,
} from '@builder.io/qwik-city'
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

export const head: DocumentHead = {
	title: 'Games by Jeff Rossi | Guess Word',
	meta: [
		{
			name: 'description',
			content: 'Games by Jeff Rossi',
		},
	],
}

export const onStaticGenerate: StaticGenerateHandler = async () => {
	const client = new RestClient()
	const req = await client.get({
		path: 'api/guess_word',
		params: { Limit: 100 },
	})
	if (req.ok) {
		const data: { Items: GuessWord[] } = await req.json()
		return {
			params: data.Items.map((i) => {
				return { id: i.id ? i.id.toString() : '' }
			}),
		}
	} else return { params: [] }
}
