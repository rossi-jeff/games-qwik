import { component$, useSignal, useTask$, $ } from '@builder.io/qwik'
import type { PokerSquare } from '../../../types/poker-square.type'
import { RestClient } from '../../../lib/rest-client'

export default component$(() => {
	const path = 'api/poker_square'
	const count = useSignal(0)
	const limit = useSignal(10)
	const offset = useSignal(0)
	const items = useSignal<PokerSquare[]>([])

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
			<h1>Poker Square Scores</h1>
			<div class="score-list">
				<div class="score-header">
					<div class="cell-48-left">User</div>
					<div class="cell-20-center">Status</div>
					<div class="cell-20-right">Score</div>
				</div>
				{items.value.map((ps) => (
					<div key={ps.id} class="score-row">
						<div class="cell-48-left">
							{ps.user ? ps.user.UserName : 'Anonymous'}
						</div>
						<div class="cell-20-center">{ps.Status}</div>
						<div class="cell-20-right">{ps.Score}</div>
					</div>
				))}
			</div>
		</div>
	)
})
