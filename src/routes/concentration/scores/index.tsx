import { component$, useSignal, $, useTask$ } from '@builder.io/qwik'
import { RestClient } from '../../../lib/rest-client'
import type { Concentration } from '../../../types/concentration.type'
import { PaginationControls } from '~/components/pagination-controls/pagination-controls'
import { type DocumentHead } from '@builder.io/qwik-city'

export default component$(() => {
	const path = 'api/concentration'
	const count = useSignal(0)
	const limit = useSignal(10)
	const offset = useSignal(0)
	const items = useSignal<Concentration[]>([])

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
			<h1>Concentration Scores</h1>
			<div class="score-list">
				<div class="score-header">
					<div class="cell-48-left">User</div>
					<div class="cell-20-center">Status</div>
					<div class="cell-20-center">Time</div>
					<div class="cell-20-center">Moves</div>
					<div class="cell-20-right">Matched</div>
				</div>
				{items.value.map((c) => (
					<div key={c.id} class="score-row">
						<div class="cell-48-left">
							{c.user ? c.user.UserName : 'Anonymous'}
						</div>
						<div class="cell-20-center">{c.Status}</div>
						<div class="cell-20-center">{c.Elapsed}</div>
						<div class="cell-20-center">{c.Moves}</div>
						<div class="cell-20-right">{c.Matched}</div>
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
	title: 'Games by Jeff Rossi | Concentration',
	meta: [
		{
			name: 'description',
			content: 'Games by Jeff Rossi',
		},
	],
}
