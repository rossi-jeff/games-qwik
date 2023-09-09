import {
	component$,
	useSignal,
	$,
	type QwikChangeEvent,
	type QRL,
} from '@builder.io/qwik'
import type { YachtCategory } from '~/enum/yacht-category.enum'
import type { YachtScoreOption } from '~/types/yacht-score-option.type'

export interface YachtScoreOptionsListProps {
	options: YachtScoreOption[]
	scoreTurn: QRL<(Category: YachtCategory) => void>
}

export const YachtScoreOptionsList = component$<YachtScoreOptionsListProps>(
	(props) => {
		const { options } = props
		const selected = useSignal(0)

		const setSelected = $((e: QwikChangeEvent<HTMLInputElement>) => {
			selected.value = parseInt(e.target.value)
		})

		const scoreTurn = $(() => {
			const option = options[selected.value]
			if (option.Category) props.scoreTurn(option.Category)
		})
		return (
			<div class="yacht-score-options-list">
				{options.map((o, i) => (
					<div key={i} class="yacht-score-options-row">
						<div class="w-6">
							<input
								type="radio"
								name="selected-option"
								value={i}
								checked={i == selected.value}
								onChange$={setSelected}
							/>
						</div>
						<div class="flex-grow">{o.Category}</div>
						<div class="w-10 text-right">{o.Score}</div>
					</div>
				))}
				<button onClick$={scoreTurn}>Score Turn</button>
			</div>
		)
	}
)
