import { component$ } from '@builder.io/qwik'
import type { TenGrandTurn } from '../../types/ten-grand-turn.type'

export interface TenGrandTurnDisplayProps {
	turn: TenGrandTurn
}

export const TenGrandTurnDisplay = component$<TenGrandTurnDisplayProps>(
	(props) => {
		const { turn } = props
		return <div>{turn.Score}</div>
	}
)
