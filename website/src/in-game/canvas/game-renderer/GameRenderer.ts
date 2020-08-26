import * as Pixi from 'pixi.js';

import { Coordinate, Tile } from './types';
import {
	TILE_COLOR_MAP,
	TILE_CORNER_RADIUS,
	TILE_HEIGHT,
	TILE_WIDTH,
} from './constants';
import TileInteractivity from './TileInteractivity';

/**
 * GameRenderer renders Rummikub elements
 */
class GameRenderer {
	private readonly width: number;
	private readonly height: number;
	private readonly renderer: Pixi.Application;
	public selectedTiles = new Set<Pixi.Graphics>();
	public renderedTiles = new Set<Pixi.Graphics>();

	constructor() {
		const container = document.getElementById('pixi-container')!;

		this.width = container.clientWidth;
		this.height = container.clientHeight;
		this.renderer = new Pixi.Application({
			width: this.width,
			height: this.height,
			backgroundColor: 0xedf2f7,
		});

		container.appendChild(this.renderer.view);
	}

	renderDeck(deck: Tile[]) {
		const xOffset = this.width / 2 - (7 * TILE_WIDTH) / 2;

		deck.forEach((tile, i) => {
			this.renderTile(
				xOffset + (i % 7) * TILE_WIDTH,
				this.height - 16 - TILE_HEIGHT * (2 - Math.floor(i / 7)),
				tile
			);
		});
	}

	renderTile(x: number, y: number, tile: Tile) {
		const rect = new Pixi.Graphics();
		const tileText = new Pixi.Text(tile.num < 0 ? ":')" : tile.num.toString(), {
			fontFamily: 'sans-serif',
			fontWeight: 'bold',
			fontSize: 32,
			fill: TILE_COLOR_MAP[tile.color],
		});

		// anchor tells pixi where the position should be anchored
		// for example, an anchor of (0, 0) means tileText.position
		// is the coordinate of the left hand corner of tileText.
		// (1, 1) = bottom right hand corner
		tileText.anchor.set(0.5, 0.5);
		tileText.position.set(TILE_WIDTH / 2, TILE_HEIGHT / 2 - 10);

		rect.interactive = true;

		rect.position.set(x, y);
		rect
			.beginFill(0xfffef2)
			.drawRoundedRect(0, 0, TILE_WIDTH, TILE_HEIGHT, TILE_CORNER_RADIUS)
			.endFill()
			.addChild(tileText);

		this.renderedTiles.add(rect);

		new TileInteractivity(rect, { gameRenderer: this });

		this.renderer.stage.addChild(rect);
	}

	renderSnapIndicator([x, y]: Coordinate) {
		const rect = new Pixi.Graphics();

		rect
			.beginFill(0xcbd5e0, 0.5)
			.drawRoundedRect(x, y, TILE_WIDTH, TILE_HEIGHT, TILE_CORNER_RADIUS)
			.endFill();

		this.renderer.stage.addChild(rect);

		return rect;
	}

	clearSnapIndicator(indicator: Nullable<Pixi.Graphics>) {
		if (indicator) this.renderer.stage.removeChild(indicator);
	}
}

export default GameRenderer;
