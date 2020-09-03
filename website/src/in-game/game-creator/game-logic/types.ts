import * as Pixi from 'pixi.js';

export enum TileColor {
	RED,
	BLUE,
	BLACK,
	ORANGE,
}

export interface Tile {
	id: number;
	num: -1 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
	color: TileColor;
	position: Nullable<Coordinate>;
	renderObject: Nullable<Pixi.Graphics>;
	tileGroup: Nullable<string>;
}

export type Coordinate = [number, number];

export interface Rect {
	topLeft: Coordinate;
	bottomRight: Coordinate;
}
