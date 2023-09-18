import { component$, useSignal, useTask$, $ } from '@builder.io/qwik'
import type { HangMan } from '../../../types/hang-man.type'
import { RestClient } from '../../../lib/rest-client'
import { PaginationControls } from '~/components/pagination-controls/pagination-controls'
import { DocumentHead, Link } from '@builder.io/qwik-city'

export default component$(() => {
	const path = 'api/hang_man'
	const count = useSignal(0)
	const limit = useSignal(10)
	const offset = useSignal(0)
	const items = useSignal<HangMan[]>([])

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
			<h1>Hang Man Scores</h1>
			<div class="score-list">
				<div class="score-header">
					<div class="cell-10-left"></div>
					<div class="cell-48-left">User</div>
					<div class="cell-20-center">Status</div>
					<div class="cell-20-center">Score</div>
					<div class="cell-20-center">Correct</div>
					<div class="cell-20-center">Wrong</div>
					<div class="cell-32-right">Word</div>
				</div>
				{items.value.map((hm) => (
					<div key={hm.id} class="score-row">
						<div class="cell-10-left">
							<Link href={'/hang_man/scores/' + hm.id}>View</Link>
						</div>
						<div class="cell-48-left">
							{hm.user ? hm.user.UserName : 'Anonymous'}
						</div>
						<div class="cell-20-center">{hm.Status}</div>
						<div class="cell-20-center">{hm.Score}</div>
						<div class="cell-20-center">{hm.Correct}</div>
						<div class="cell-20-center">{hm.Wrong}</div>
						<div class="cell-32-right">{hm.word ? hm.word.Word : 'N/A'}</div>
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
	title: 'Games by Jeff Rossi | Hang Man',
	meta: [
		{
			name: 'description',
			content: 'Games by Jeff Rossi',
		},
	],
}
