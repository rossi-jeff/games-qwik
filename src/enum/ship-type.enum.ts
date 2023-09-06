export enum ShipType {
	BattleShip = 'BattleShip',
	Carrier = 'Carrier',
	Cruiser = 'Cruiser',
	PatrolBoat = 'PatrolBoat',
	SubMarine = 'SubMarine',
}

export const ShipTypeLength: { [key: string]: number } = {
	BattleShip: 4,
	Carrier: 5,
	Cruiser: 3,
	PatrolBoat: 2,
	SubMarine: 3,
}

export const ShipTypeValue: { [key: string]: ShipType } = {
	BattleShip: ShipType.BattleShip,
	Carrier: ShipType.Carrier,
	Cruiser: ShipType.Cruiser,
	PatrolBoat: ShipType.PatrolBoat,
	SubMarine: ShipType.SubMarine,
}

export const ShipDirections = ['right', 'down', 'left', 'up']

export const ShipTypeArray = Object.values(ShipType)
