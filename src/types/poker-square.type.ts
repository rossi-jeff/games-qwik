import { GameStatus } from "../enum/game-status.enum";
import { User } from "./user.type";

export type PokerSquare = {
  id?: number;
  user_id?: number;
  Status?: GameStatus;
  Score?: number;
  created_at?: Date;
  updated_at?: Date;

  user?: User;
};
