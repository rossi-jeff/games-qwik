import type { Navy } from '../enum/navy.enum'
import type { ShipType } from '../enum/ship-type.enum'
import type { SeaBattleShipGridPoint } from './sea-battle-ship-grid-point.type'
import type { SeaBattleShipHit } from './sea-battle-ship-hit.type'

export type SeaBattleShip = {
	id?: number
	sea_battle_id?: number
	Type?: ShipType
	Navy?: Navy
	Size?: number
	Sunk?: boolean
	created_at?: Date
	updated_at?: Date

	points?: SeaBattleShipGridPoint[]
	hits?: SeaBattleShipHit[]
}
