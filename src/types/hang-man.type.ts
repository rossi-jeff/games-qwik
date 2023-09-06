import type { GameStatus } from '../enum/game-status.enum'
import type { User } from './user.type'
import type { Word } from './word.type'

export type HangMan = {
	id?: number
	user_id?: number
	word_id?: number
	Correct?: string
	Wrong?: string
	Status?: GameStatus
	Score?: number
	created_at?: Date
	updated_at?: Date

	word?: Word
	user?: User
}
