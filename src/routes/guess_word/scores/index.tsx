import { component$, useSignal, useTask$, $ } from '@builder.io/qwik'
import type { GuessWord } from '../../../types/guess-word.type'
import { RestClient } from '../../../lib/rest-client'
import { PaginationControls } from '~/components/pagination-controls/pagination-controls'
import { DocumentHead, Link } from '@builder.io/qwik-city'

export default component$(() => {
	const path = 'api/guess_word'
	const count = useSignal(0)
	const limit = useSignal(10)
	const offset = useSignal(0)
	const items = useSignal<GuessWord[]>([])

	const loadData = $(
		async (path: string, params?: { [key: string]: number }) => {
			const client = new RestClient()
			const req = await client.get({ path, params })
			return await req.json()
		}
	)

	const limitChanged = $(async (l: number) => {
		limit.value = l
		offset.value = 0
		const params = { Limit: limit.value, Offset: offset.value }
		const data = await loadData(path, params)
		count.value = data.Count
		limit.value = data.Limit
		offset.value = data.Offset
		items.value = data.Items
	})

	const pageChanged = $(async (p: number) => {
		offset.value = (p - 1) * limit.value
		const params = { Limit: limit.value, Offset: offset.value }
		const data = await loadData(path, params)
		count.value = data.Count
		limit.value = data.Limit
		offset.value = data.Offset
		items.value = data.Items
	})

	useTask$(async () => {
		const params = { Limit: limit.value, Offset: offset.value }
		const data = await loadData(path, params)
		count.value = data.Count
		limit.value = data.Limit
		offset.value = data.Offset
		items.value = data.Items
	})
	return (
		<div>
			<h1>Guess Word Scores</h1>
			<div class="score-list">
				<div class="score-header">
					<div class="cell-10-left"></div>
					<div class="cell-48-left">User</div>
					<div class="cell-20-center">Status</div>
					<div class="cell-20-center">Score</div>
					<div class="cell-20-center">Word</div>
					<div class="cell-20-right">Length</div>
				</div>
				{items.value.map((gw) => (
					<div key={gw.id} class="score-row">
						<div class="cell-10-left">
							<Link href={'/guess_word/scores/' + gw.id}>View</Link>
						</div>
						<div class="cell-48-left">
							{gw.user ? gw.user.UserName : 'Anonymous'}
						</div>
						<div class="cell-20-center">{gw.Status}</div>
						<div class="cell-20-center">{gw.Score}</div>
						<div class="cell-20-center">{gw.word ? gw.word.Word : 'N/A'}</div>
						<div class="cell-20-right">{gw.word ? gw.word.Length : 'N/A'}</div>
					</div>
				))}
			</div>
			<PaginationControls
				count={count.value}
				limit={limit.value}
				offset={offset.value}
				limitChanged={limitChanged}
				pageChanged={pageChanged}
			/>
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
