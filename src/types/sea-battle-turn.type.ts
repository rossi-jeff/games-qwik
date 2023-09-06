import type { Navy } from '../enum/navy.enum'
import type { ShipType } from '../enum/ship-type.enum'
import type { Target } from '../enum/target.enum'

export type SeaBattleTurn = {
	id?: number
	sea_battle_id?: number
	ShipType?: ShipType
	Navy?: Navy
	Target?: Target
	Horizontal?: string
	Vertical?: number
	created_at?: Date
	updated_at?: Date
}
