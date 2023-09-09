import { type QRL, component$ } from '@builder.io/qwik'
import type { TenGrandOption } from '../../types/ten-grand-option.type'

export interface TenGrandScoreOptionListProps {
	options: TenGrandOption[]
	scoreOptions: QRL<() => void>
}

export const TenGrandScoreOptionList = component$<TenGrandScoreOptionListProps>(
	(props) => {
		const { options } = props
		return (
			<div>
				{options.map((o, i) => (
					<div key={i} class="flex flex-wrap">
						<div>{o.Category}</div>
						<div>{o.Score}</div>
					</div>
				))}
			</div>
		)
	}
)
