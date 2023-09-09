import { component$ } from '@builder.io/qwik'
import type { TenGrand } from '../../types/ten-grand.type'

export interface TenGrandScoreCardProps {
	tenGrand: TenGrand
}

export const TenGrandScoreCard = component$<TenGrandScoreCardProps>((props) => {
	const { tenGrand } = props
	return (
		<div>
			TenGrandScoreCard component works!
			<div>{tenGrand.Score}</div>
		</div>
	)
})
