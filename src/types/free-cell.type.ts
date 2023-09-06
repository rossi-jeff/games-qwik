import { User } from "./user.type";
import { GameStatus } from "../enum/game-status.enum"

export type FreeCell = {
	id?: number;
	user_id?: number;
	Status?: GameStatus;
	Moves?: number;
	Elapsed?: number;
	created_at?: Date;
	updated_at?: Date;

	user?: User;
};
