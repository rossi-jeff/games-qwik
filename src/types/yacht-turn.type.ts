import type { YachtCategory } from '../enum/yacht-category.enum';

export type YachtTurn = {
	id?: number;
	yacht_id?: number;
	RollOne?: string;
	RollTwo?: string;
	RollThree?: string;
	Category?: YachtCategory;
	Score?: number;
	created_at?: Date;
	updated_at?: Date;
};
