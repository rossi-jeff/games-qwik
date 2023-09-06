import { component$, useTask$, $, useSignal } from '@builder.io/qwik'
import { RestClient } from '../../../lib/rest-client'
import type { CodeBreaker } from '../../../types/code-breaker.type'

export default component$(() => {
	const path = 'api/code_breaker'
	const count = useSignal(0)
	const limit = useSignal(10)
	const offset = useSignal(0)
	const items = useSignal<CodeBreaker[]>([])

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
			<h1>Code Breaker Scores</h1>
			<div class="score-list">
				<div class="score-header">
					<div class="cell-48-left">User</div>
					<div class="cell-20-center">Status</div>
					<div class="cell-20-center">Score</div>
					<div class="cell-20-center">Colors</div>
					<div class="cell-20-right">Columns</div>
				</div>
				{items.value.map((cb) => (
					<div key={cb.id} class="score-row">
						<div class="cell-48-left">
							{cb.user ? cb.user.UserName : 'Anonymous'}
						</div>
						<div class="cell-20-center">{cb.Status}</div>
						<div class="cell-20-center">{cb.Score}</div>
						<div class="cell-20-center">{cb.Colors}</div>
						<div class="cell-20-right">{cb.Columns}</div>
					</div>
				))}
			</div>
		</div>
	)
})
