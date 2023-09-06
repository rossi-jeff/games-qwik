import { component$, useSignal, useTask$, $ } from '@builder.io/qwik'
import type { GuessWord } from '../../../types/guess-word.type'
import { RestClient } from '../../../lib/rest-client'

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
					<div class="cell-48-left">User</div>
					<div class="cell-20-center">Status</div>
					<div class="cell-20-center">Score</div>
					<div class="cell-20-center">Word</div>
					<div class="cell-20-right">Length</div>
				</div>
				{items.value.map((gw) => (
					<div key={gw.id} class="score-row">
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
		</div>
	)
})
