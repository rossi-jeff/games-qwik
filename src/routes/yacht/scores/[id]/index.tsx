import { component$, useSignal, useTask$ } from '@builder.io/qwik'
import {
	type DocumentHead,
	Link,
	useLocation,
	type StaticGenerateHandler,
} from '@builder.io/qwik-city'
import { YachtScoreCard } from '~/components/yacht-score-card/yacht-score-card'
import { RestClient } from '~/lib/rest-client'
import type { Yacht } from '~/types/yacht.type'

export default component$(() => {
	const game = useSignal<Yacht>({})
	const loc = useLocation()

	useTask$(async () => {
		const client = new RestClient()
		const req = await client.get({ path: `api/yacht/${loc.params.id}` })
		if (req.ok) game.value = await req.json()
	})
	return (
		<div>
			{game.value.turns && game.value.turns.length > 0 && (
				<YachtScoreCard
					total={game.value.Total || 0}
					turns={game.value.turns}
				/>
			)}
			<div>
				<Link href="/yacht/scores">Top Scores</Link>
			</div>
		</div>
	)
})

export const head: DocumentHead = {
	title: 'Games by Jeff Rossi | Yacht',
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
		path: 'api/yacht',
		params: { Limit: 100 },
	})
	if (req.ok) {
		const data: { Items: Yacht[] } = await req.json()
		return {
			params: data.Items.map((i) => {
				return { id: i.id ? i.id.toString() : '' }
			}),
		}
	} else return { params: [] }
}
