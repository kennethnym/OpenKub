import * as Pixi from 'pixi.js';

import { TILE_BACKGROUND_COLOR, TILE_HEIGHT, TILE_WIDTH } from './constants';

import GameRenderer from '.';
import isRectInRect from './utils/is-rect-in-rect';
import { Coordinate, Rect } from './types';

interface Dependencies {
	gameRenderer: GameRenderer;
}

/**
 * Adds tile-specific interactivity to Pixi.Graphics
 */
class TileInteractivity {
	private gameRenderer: GameRenderer;
	private isDragging = false;
	private isMoved = false;
	private isSelected = false;
	private data: Nullable<Pixi.InteractionData> = null;
	private snapIndicator: Nullable<Pixi.Graphics> = null;
	private snapPosition: Nullable<Coordinate> = null;

	constructor(private tile: Pixi.Graphics, { gameRenderer }: Dependencies) {
		this.gameRenderer = gameRenderer;

		tile
			.on('mouseover', this.onMouseOver)
			.on('mouseout', this.onMouseOut)
			.on('mousedown', this.onMouseDown)
			.on('mousemove', this.onMouseMove)
			.on('mouseup', this.onMouseUp)
			.on('mouseupoutside', this.onMouseUp);
	}

	onMouseOver = () => {
		this.tile.tint = 0xf7f6eb;
	};

	onMouseOut = () => {
		if (!this.isSelected) {
			this.tile.tint = 0xffffff;
		}
	};

	onMouseDown = (event: Pixi.InteractionEvent) => {
		this.isDragging = true;
		this.data = event.data;
	};

	onMouseMove = () => {
		if (this.isDragging) {
			const domEvent = this.data!.originalEvent as MouseEvent;
			this.isMoved = true;

			if (this.isSelected) {
				// this tile is in a selection group
				// move all selected tiles
				for (const tile of this.gameRenderer.selectedTiles) {
					tile.x += domEvent.movementX;
					tile.y += domEvent.movementY;
				}
			} else {
				this.tile.x += domEvent.movementX;
				this.tile.y += domEvent.movementY;

				let canSnap = false;

				for (const tile of this.gameRenderer.renderedTiles) {
					if (tile === this.tile) continue;
					let snapArea: Rect;

					if (tile.x > this.tile.x) {
						snapArea = {
							topLeft: [tile.x - TILE_WIDTH, tile.y],
							bottomRight: [tile.x, tile.y + TILE_HEIGHT],
						};
					} else {
						snapArea = {
							topLeft: [tile.x + TILE_WIDTH, tile.y],
							bottomRight: [tile.x + TILE_WIDTH * 2, tile.y + TILE_HEIGHT],
						};
					}

					// determine if the current tile is in the snap area
					if (
						isRectInRect(
							{
								topLeft: [this.tile.x, this.tile.y],
								bottomRight: [
									this.tile.x + TILE_WIDTH,
									this.tile.y + TILE_HEIGHT,
								],
							},
							snapArea
						)
					) {
						canSnap = true;

						// check if the snap area is overlapping with other tiles
						let hasOverlap = false;
						for (const t of this.gameRenderer.renderedTiles) {
							if (t === this.tile || t === tile) continue;
							if (
								isRectInRect(snapArea, {
									topLeft: [t.x, t.y],
									bottomRight: [t.x + TILE_WIDTH, t.y + TILE_HEIGHT],
								})
							) {
								hasOverlap = true;
								break;
							}
						}

						console.log('hasOverlap', hasOverlap);

						if (hasOverlap) continue;

						this.gameRenderer.clearSnapIndicator(this.snapIndicator);

						this.snapPosition = snapArea.topLeft;
						this.snapIndicator = this.gameRenderer.renderSnapIndicator(
							snapArea.topLeft
						);

						break;
					}
				}

				if (!canSnap) {
					this.gameRenderer.clearSnapIndicator(this.snapIndicator);
					this.snapPosition = null;
				}
			}
		}
	};

	onMouseUp = () => {
		this.gameRenderer.clearSnapIndicator(this.snapIndicator);

		// snap this tile to snap area
		if (this.snapPosition) {
			this.tile.position.set(this.snapPosition[0], this.snapPosition[1]);
			this.snapPosition = null;
		}

		// if this tile has not been moved, select it
		if (!this.isMoved) {
			this.isSelected = !this.isSelected;
			this.tile.tint = this.isSelected ? 0xf7f6eb : TILE_BACKGROUND_COLOR;

			if (this.isSelected) {
				this.gameRenderer.selectedTiles.add(this.tile);
			} else {
				this.gameRenderer.selectedTiles.delete(this.tile);
			}
		} else {
			this.isMoved = false;
		}

		this.isDragging = false;
		this.data = null;
	};
}

export default TileInteractivity;
