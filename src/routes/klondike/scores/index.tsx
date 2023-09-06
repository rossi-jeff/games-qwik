import { component$, useSignal, useTask$, $ } from '@builder.io/qwik'
import type { Klondike } from '../../../types/klondike.type'
import { RestClient } from '../../../lib/rest-client'

export default component$(() => {
	const path = 'api/klondike'
	const count = useSignal(0)
	const limit = useSignal(10)
	const offset = useSignal(0)
	const items = useSignal<Klondike[]>([])

	const loadData = $(
		async (path: string, params?: { [key: string]: number }) => {
			const client = new RestClient()
			const req = await client.get({ path, params })
			return await req.json()
		}
	)

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
			<h1>Klondike Scores</h1>
			<div class="score-list">
				<div class="score-header">
					<div class="cell-48-left">User</div>
					<div class="cell-20-center">Status</div>
					<div class="cell-20-center">Time</div>
					<div class="cell-20-right">Moves</div>
				</div>
				{items.value.map((k) => (
					<div key={k.id} class="score-row">
						<div class="cell-48-left">
							{k.user ? k.user.UserName : 'Anonymous'}
						</div>
						<div class="cell-20-center">{k.Status}</div>
						<div class="cell-20-center">{k.Elapsed}</div>
						<div class="cell-20-right">{k.Moves}</div>
					</div>
				))}
			</div>
		</div>
	)
})
