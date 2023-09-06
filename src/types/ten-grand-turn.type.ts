import type { TenGrandScore } from './ten-grand-score.type'

export type TenGrandTurn = {
	id?: number
	ten_grand_id?: number
	Score?: number
	created_at?: Date
	updated_at?: Date

	scores?: TenGrandScore[]
}
