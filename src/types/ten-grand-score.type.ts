import type { TenGrandCategory } from "../enum/ten-grand-category.enum";

export type TenGrandScore = {
	id?: number;
	ten_grand_turn_id?: number;
	Dice?: string;
	Category?: TenGrandCategory;
	Score?: number;
	created_at?: Date;
	updated_at?: Date;
};