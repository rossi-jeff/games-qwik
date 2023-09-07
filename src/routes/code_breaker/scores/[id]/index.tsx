import { component$, useSignal, useTask$ } from '@builder.io/qwik'
import { Link, useLocation } from '@builder.io/qwik-city'
import type { CodeBreaker } from '../../../../types/code-breaker.type'
import { RestClient } from '../../../../lib/rest-client'
import { CodeBreakerGuessList } from '../../../../components/code-breaker-guess-list/code-breaker-guess-list'
import { CodeBreakerSolution } from '../../../../components/code-breaker-solution/code-breaker-solution'

export default component$(() => {
	const game = useSignal<CodeBreaker>({})
	const loc = useLocation()
	useTask$(async () => {
		const client = new RestClient()
		const req = await client.get({ path: `api/code_breaker/${loc.params.id}` })
		if (req.ok) game.value = await req.json()
	})
	return (
		<div>
			{game.value.guesses && game.value.guesses.length > 0 && (
				<CodeBreakerGuessList guesses={game.value.guesses} />
			)}
			{game.value.codes && game.value.codes.length > 0 && (
				<CodeBreakerSolution codes={game.value.codes} />
			)}
			<div>
				<Link href="/code_breaker/scores">Top Scores</Link>
			</div>
		</div>
	)
})
