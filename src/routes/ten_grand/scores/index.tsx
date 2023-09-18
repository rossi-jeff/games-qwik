import { component$, useSignal, useTask$, $ } from '@builder.io/qwik'
import { type DocumentHead, Link } from '@builder.io/qwik-city'
import { PaginationControls } from '~/components/pagination-controls/pagination-controls'
import { RestClient } from '~/lib/rest-client'
import type { TenGrand } from '~/types/ten-grand.type'

export default component$(() => {
	const path = 'api/ten_grand'
	const count = useSignal(0)
	const limit = useSignal(10)
	const offset = useSignal(0)
	const items = useSignal<TenGrand[]>([])

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
			<h1>Ten Grand Scores</h1>
			<div class="score-list">
				<div class="score-header">
					<div class="cell-10-left"></div>
					<div class="cell-48-left">User</div>
					<div class="cell-20-center">Status</div>
					<div class="cell-20-right">Score</div>
				</div>
				{items.value.map((tg) => (
					<div key={tg.id} class="score-row">
						<div class="cell-10-left">
							<Link href={'/ten_grand/scores/' + tg.id}>View</Link>
						</div>
						<div class="cell-48-left">
							{tg.user ? tg.user.UserName : 'Anonymous'}
						</div>
						<div class="cell-20-center">{tg.Status}</div>
						<div class="cell-20-right">{tg.Score}</div>
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
	title: 'Games by Jeff Rossi | Ten Grand',
	meta: [
		{
			name: 'description',
			content: 'Games by Jeff Rossi',
		},
	],
}
