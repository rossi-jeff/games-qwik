import type { GameStatus } from '../enum/game-status.enum'
import type { SeaBattleShip } from './sea-batte-ship.type'
import type { SeaBattleTurn } from './sea-battle-turn.type'
import type { User } from './user.type'

export type SeaBattle = {
	id?: number
	Axis?: number
	user_id?: number
	Status?: GameStatus
	Score?: number
	created_at?: Date
	updated_at?: Date

	ships?: SeaBattleShip[]
	turns?: SeaBattleTurn[]
	user?: User
}
