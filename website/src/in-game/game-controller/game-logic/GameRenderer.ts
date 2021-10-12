import * as Pixi from 'pixi.js';

import { Coordinate, Rect, Tile } from './types';
import {
	DECK_HEIGHT,
	TILE_COLOR_MAP,
	TILE_CORNER_RADIUS,
	TILE_HEIGHT,
	TILE_WIDTH,
} from './constants';
import TileInteractivity from './TileInteractivity';
import EventCommunicator from './EventCommunicator';
import GameStateManager from './GameStateManager';
import { isRectInRect } from './utils';

interface Dependencies {
	communicator: EventCommunicator;
	stateManager: GameStateManager;
}

/**
 * GameRenderer handles graphical elements of the game
 */
class GameRenderer {
	private readonly renderer: Pixi.Application;
	private readonly communicator: EventCommunicator;
	private readonly stateManager: GameStateManager;

	readonly width: number;
	readonly height: number;
	readonly deck: Rect;
	readonly interactionLayer: Pixi.Graphics;

	constructor({ communicator, stateManager }: Dependencies) {
		this.communicator = communicator;
		this.stateManager = stateManager;

		const container = document.getElementById('pixi-container')!;

		this.width = container.clientWidth;
		this.height = container.clientHeight;
		this.deck = {
			topLeft: [0, this.height - DECK_HEIGHT],
			bottomRight: [this.width, this.height],
		};
		this.renderer = new Pixi.Application({
			width: this.width,
			height: this.height,
			backgroundColor: 0xedf2f7,
		});

		container.appendChild(this.renderer.view);

		this.interactionLayer = this.renderInteractionLayer();
	}

	/**
	 * Renders a global interaction layer that is as big as the renderer
	 */
	private renderInteractionLayer() {
		const layer = new Pixi.Graphics();

		layer.interactive = true;

		layer
			.beginFill(0x0, 0.01)
			.drawRect(0, 0, this.width, this.height)
			.on('mousedown', () => {
				console.log('asdsadasd');
			});

		this.renderer.stage.addChild(layer);

		return layer;
	}

	/**
	 * Renders the deck and the initial 14 tiles.
	 * @param deck {Tile[]} The initial tiles to be rendered
	 */
	renderDeck(deck: Tile[]) {
		const xOffset = this.width / 2 - (7 * TILE_WIDTH) / 2;

		const deckBackground = new Pixi.Graphics();

		deckBackground
			.beginFill(0xe2e8f0)
			.drawRect(
				this.deck.topLeft[0],
				this.deck.topLeft[1],
				this.width,
				DECK_HEIGHT
			)
			.endFill();

		this.renderer.stage.addChild(deckBackground);

		deck.forEach((tile, i) => {
			this.renderTile(
				xOffset + (i % 7) * TILE_WIDTH,
				this.height - 16 - TILE_HEIGHT * (2 - Math.floor(i / 7)),
				tile
			);
		});
	}

	/**
	 * Renders the given tile at the given coordinate (top left)
	 * @param x {number} The x-coordinate of the top left of the tile
	 * @param y {number} The y-coordinate of the top right of the tile
	 * @param tile {Tile} The tile to be rendered
	 */
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

		const renderedTile: Tile = {
			...tile,
			position: [x, y],
			renderObject: rect,
		};

		this.stateManager.addRenderedTile(renderedTile);

		new TileInteractivity(renderedTile, {
			gameRenderer: this,
			stateManager: this.stateManager,
			communicator: this.communicator,
		});

		this.renderer.stage.addChild(rect);
	}

	/**
	 * Renders a snap indicator indicating that the tile being dragged
	 * can snap to the position of the indicator.
	 * @param x {number} The x-coordinate of the top left corner of the indicator
	 * @param y {number} The y-coordinate of the top left corner of the indicator
	 */
	renderSnapIndicator([x, y]: Coordinate) {
		const rect = new Pixi.Graphics();

		rect
			.beginFill(0xcbd5e0, 0.5)
			.drawRoundedRect(x, y, TILE_WIDTH, TILE_HEIGHT, TILE_CORNER_RADIUS)
			.endFill();

		this.renderer.stage.addChild(rect);

		return rect;
	}

	/**
	 * Removes a snap indicator. This will be called when a tile can no longer
	 * be snapped to the location of the indicator, possibly because the tile
	 * is too far away.
	 * @param indicator {Pixi.Graphics} The render object of the indicator
	 */
	clearSnapIndicator(indicator: Nullable<Pixi.Graphics>) {
		if (indicator) this.renderer.stage.removeChild(indicator);
	}

	/**
	 * Given a tile position, determine if that position is in deck
	 */
	isTilePositionInDeck(pos: Coordinate) {
		return isRectInRect(
			{
				topLeft: pos,
				bottomRight: [pos[0] + TILE_WIDTH, pos[1] + TILE_HEIGHT],
			},
			this.deck
		);
	}

	highlightInvalidGroups() {
		for (const invalidGroupID of this.stateManager.invalidGroups) {
			for (const tile of this.stateManager.tileGroups.get(invalidGroupID)!) {
				tile.renderObject!.tint = 0xffaaaa;
			}
		}
	}

	clearInvalidGroupHighlights() {
		for (const invalidGroupID of this.stateManager.invalidGroups) {
			const invalidTileGroup = this.stateManager.tileGroups.get(invalidGroupID);
			if (invalidTileGroup) {
				for (const tile of invalidTileGroup) {
					tile.renderObject!.tint = 0xffffff;
				}
			}
		}
	}
}

export default GameRenderer;
