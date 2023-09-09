import { component$ } from '@builder.io/qwik'
import type { YachtTurn } from '~/types/yacht-turn.type'

export interface YachtScoreCardProps {
	total: number
	turns: YachtTurn[]
}

export const YachtScoreCard = component$<YachtScoreCardProps>((props) => {
	const { total, turns } = props
	return (
		<div class="yacht-score-card">
			{turns.map((t, i) => (
				<div key={i} class="yacht-score-card-row">
					<div class="flex-grow">{t.Category}</div>
					<div class="w-10 text-right">{t.Score}</div>
				</div>
			))}
			<div class="yacht-score-card-row">
				<div class="flex-grow text-right">Total:</div>
				<div class="w-10 text-right">{total}</div>
			</div>
		</div>
	)
})
