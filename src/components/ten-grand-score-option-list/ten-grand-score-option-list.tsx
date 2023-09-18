import {
	type QRL,
	component$,
	useStore,
	$,
	type QwikChangeEvent,
	useVisibleTask$,
} from '@builder.io/qwik'
import type { TenGrandOption } from '../../types/ten-grand-option.type'

export interface TenGrandScoreOptionListProps {
	options: TenGrandOption[]
	scoreOptions: QRL<(options: TenGrandOption[]) => void>
}

export const TenGrandScoreOptionList = component$<TenGrandScoreOptionListProps>(
	(props) => {
		const { options } = props
		const selected = useStore<{
			idx: number[]
			options: TenGrandOption[]
		}>({
			idx: [],
			options: [],
		})

		const setSelected = $((e: QwikChangeEvent<HTMLInputElement>) => {
			const value = parseInt(e.target.value)
			const idx = selected.idx.indexOf(value)
			if (idx == -1) {
				selected.idx.push(value)
			} else {
				selected.idx.splice(idx, 1)
			}
			const opts: TenGrandOption[] = []
			for (const idx of selected.idx) {
				const option = options[idx]
				opts.push(option)
			}
			selected.options = opts
		})

		const scoreOptions = $(() => {
			if (selected.options.length == 0) return
			props.scoreOptions(selected.options)
		})

		useVisibleTask$(({ track }) => {
			track(() => props.options)
			selected.idx = []
			selected.options = []
		})

		return (
			<div class="ten-grand-options-list">
				{options.map((o, i) => (
					<div key={i} class="ten-grand-options-row">
						<div class="mr-2">
							<input
								type="checkbox"
								name="selected"
								value={i}
								onChange$={setSelected}
								checked={selected.idx.includes(i)}
							/>
						</div>
						<div class="flex-grow">{o.Category}</div>
						<div>{o.Score}</div>
					</div>
				))}
				<button onClick$={scoreOptions} class="mt-2">
					Score Options
				</button>
			</div>
		)
	}
)
