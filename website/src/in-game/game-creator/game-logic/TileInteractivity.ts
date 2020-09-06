import * as Pixi from 'pixi.js';

import { TILE_BACKGROUND_COLOR, TILE_HEIGHT, TILE_WIDTH } from './constants';
import { Coordinate, Rect, Tile } from './types';
import GameRenderer from './GameRenderer';
import { isRectInRect } from './utils';
import EventCommunicator, { GameEvent } from './EventCommunicator';
import GameStateManager from './GameStateManager';

interface Dependencies {
	gameRenderer: GameRenderer;
	stateManager: GameStateManager;
	communicator: EventCommunicator;
}

/**
 * Adds tile-specific interactivity to a Tile
 */
class TileInteractivity {
	private isDragging = false;
	private isMoved = false;
	private isSelected = false;
	private data: Nullable<Pixi.InteractionData> = null;
	private snapIndicator: Nullable<Pixi.Graphics> = null;
	private snapPosition: Nullable<Coordinate> = null;

	/**
	 * The tile that this tile will snap to
	 */
	private snapToTile: Nullable<Tile> = null;

	private gameRenderer: GameRenderer;
	private stateManager: GameStateManager;
	private communicator: EventCommunicator;

	constructor(
		private tile: Tile,
		{ gameRenderer, stateManager, communicator }: Dependencies
	) {
		this.gameRenderer = gameRenderer;
		this.stateManager = stateManager;
		this.communicator = communicator;

		tile
			.renderObject!.on('mouseover', this.onMouseOver)
			.on('mouseout', this.onMouseOut)
			.on('mousedown', this.onMouseDown)
			.on('mousemove', this.onMouseMove)
			.on('mouseup', this.onMouseUp)
			.on('mouseupoutside', this.onMouseUp);
	}

	/**
	 * Finds an area where this tile can snap to.
	 * Returns a boolean representing whether such area is found.
	 */
	private findSnapArea() {
		let canSnap = false;

		for (const [, tile] of this.stateManager.renderedTiles) {
			if (tile.renderObject === this.tile.renderObject) continue;

			const snapArea: Rect =
				tile.renderObject!.x > this.tile.renderObject!.x
					? {
							topLeft: [
								tile.renderObject!.x - TILE_WIDTH,
								tile.renderObject!.y,
							],
							bottomRight: [
								tile.renderObject!.x,
								tile.renderObject!.y + TILE_HEIGHT,
							],
					  }
					: {
							topLeft: [
								tile.renderObject!.x + TILE_WIDTH,
								tile.renderObject!.y,
							],
							bottomRight: [
								tile.renderObject!.x + TILE_WIDTH * 2,
								tile.renderObject!.y + TILE_HEIGHT,
							],
					  };

			// determine if the current tile is in the snap area
			if (
				isRectInRect(
					{
						topLeft: [this.tile.renderObject!.x, this.tile.renderObject!.y],
						bottomRight: [
							this.tile.renderObject!.x + TILE_WIDTH,
							this.tile.renderObject!.y + TILE_HEIGHT,
						],
					},
					snapArea
				)
			) {
				canSnap = true;

				// check if the snap area is overlapping with other tiles
				let hasOverlap = false;
				for (const [, t] of this.stateManager.renderedTiles) {
					if (t.renderObject === this.tile.renderObject || t === tile) continue;
					if (
						isRectInRect(snapArea, {
							topLeft: [t.renderObject!.x, t.renderObject!.y],
							bottomRight: [
								t.renderObject!.x + TILE_WIDTH,
								t.renderObject!.y + TILE_HEIGHT,
							],
						})
					) {
						hasOverlap = true;
						break;
					}
				}

				if (hasOverlap) continue;

				this.gameRenderer.clearSnapIndicator(this.snapIndicator);

				this.snapToTile = tile;
				this.snapPosition = snapArea.topLeft;
				this.snapIndicator = this.gameRenderer.renderSnapIndicator(
					snapArea.topLeft
				);

				break;
			}
		}

		return canSnap;
	}

	/**
	 * Places/removes tiles onto/from the board.
	 */
	private placeTile() {
		if (this.isSelected) {
			// this tile is selected
			const processedTiles = new Set<number>();

			// for of loop is the slowest
			// but i like the syntax of it
			// this.stateManager.selectedTiles is not big anyway
			// performance impact is negligible
			for (const tile of this.stateManager.selectedTiles) {
				if (processedTiles.has(tile.id)) continue;
				if (this.gameRenderer.isTilePositionInDeck(tile.position!)) {
					// this tile is put back into the deck
					if (tile.tileGroup) {
						// remove this tile from its previous group
						this.stateManager.removeTileFromGroup(tile);
						tile.tileGroup = null;
					}
					continue;
				}

				if (tile.tileGroup) {
					// this tile is in a group

					const prevGroup = this.stateManager.getTileGroup(tile);
					const prevGroupSize = prevGroup.length;
					const prevGroupID = tile.tileGroup;

					// calculate new groups that are made after this tile
					// is removed from its previous group
					//
					// find other tiles in that group that are also selected
					// since they are moving along with this tile
					// those other tiles are also removed from their previous group
					// and so this action can create multiple other groups
					// depending on how they are removed

					// newGroups tracks the partitions of the previous groups
					// created by the move explained above
					// start = index of the start of the partition in the previous group
					// end = index of the end of the partition in the previous group
					// these partitions will be removed from their group
					// and will form a new group of their own
					const newGroups: {
						start: number;
						end: number;
					}[] = [];
					// this boolean flag is used to determine
					// whether we expand the previous partitions
					// or we create a new partition
					let isPrevTileSelected = false;

					prevGroup.forEach((currentTile, i) => {
						if (this.stateManager.isTileSelected(currentTile)) {
							// this tile in the previous group is selected
							// remove it from the group
							this.stateManager.removeTileFromGroup(currentTile);
							// this selected tile is already processed
							// we need to skip this tile in the outer loop
							processedTiles.add(currentTile.id);
							if (isPrevTileSelected) {
								// its previous tile is also selected
								// we expand the partition
								const currentGroup = newGroups[newGroups.length - 1];
								currentGroup.end = i;
							} else {
								// its previous tile is NOT selected
								// this tile is the start of a new partition
								newGroups.push({ start: i, end: i });
								isPrevTileSelected = true;
							}
						} else {
							// this tile in the previous group is NOT selected
							isPrevTileSelected = false;
						}
					});

					if (
						newGroups.length === 1 &&
						newGroups[0].start === 0 &&
						newGroups[0].end === prevGroupSize - 1
					) {
						// the entire previous group is selected
						// no new partitions are created
						// restore it back to tileGroups map
						this.stateManager.tileGroups.set(prevGroupID, prevGroup);
						continue;
					}

					// number of partitions (new groups) that are created
					const newGroupsCount = newGroups.length;

					// loop over all the partitions
					newGroups.forEach((currentGroup, i) => {
						// as explained above, this partition will form its own group
						this.stateManager.addTileGroup(
							prevGroup.slice(currentGroup.start, currentGroup.end + 1)
						);

						if (i === 0 && currentGroup.start !== 0) {
							// this partition does not start on the beginning of the previous group
							// which means to the left of this partition there are some remaining tiles
							this.stateManager.tileGroups.set(
								prevGroupID,
								prevGroup.slice(0, currentGroup.start)
							);
						} else if (i !== newGroupsCount - 1) {
							// in between partitions are a new group of tiles
							const nextGroup = newGroups[i + 1];
							this.stateManager.addTileGroup(
								prevGroup.slice(currentGroup.end + 1, nextGroup.start)
							);
						} else if (currentGroup.end !== newGroupsCount - 1) {
							// this partition does not end at the end of the previous group
							// to the right of this partitions there are some remaining tiles
							// they will form a group of their own
							this.stateManager.addTileGroup(
								prevGroup.slice(currentGroup.end + 1)
							);
						}
					});
				} else {
					// this tile is taken from the deck
					// we check if there are other selected tiles next to this tile
					// they will be in the same group
					const leftTiles = [];
					const rightTiles = [];

					const leftPos: Coordinate = [
						tile.position![0] - TILE_WIDTH,
						tile.position![1],
					];
					const rightPos: Coordinate = [
						tile.position![0] + TILE_WIDTH,
						tile.position![1],
					];

					let hasLeftTile = false;
					let hasRightTile = false;

					do {
						let leftTile;
						let rightTile;

						for (const tile of this.stateManager.selectedTiles) {
							if (processedTiles.has(tile.id)) continue;
							if (
								tile.position![0] === leftPos[0] &&
								tile.position![1] === leftPos[1]
							) {
								leftTile = tile;
								leftPos[0] = tile.position![0] - TILE_WIDTH;
								processedTiles.add(tile.id);
								leftTiles.push(leftTile);
								break;
							}
							if (
								tile.position![0] === rightPos[0] &&
								tile.position![1] === rightPos[1]
							) {
								rightTile = tile;
								rightPos[0] = tile.position![0] + TILE_WIDTH;
								processedTiles.add(tile.id);
								rightTiles.push(rightTile);
								break;
							}
						}

						hasLeftTile = leftTile !== undefined;
						hasRightTile = rightTile !== undefined;
					} while (hasLeftTile || hasRightTile);

					this.stateManager
						.addPlacedTile(tile)
						.addTileGroup([...leftTiles.reverse(), tile, ...rightTiles]);
				}
			}
		} else if (
			this.gameRenderer.isTilePositionInDeck(
				this.snapPosition ?? this.tile.position!
			)
		) {
			// this tile is in the deck
			if (this.tile.tileGroup) {
				// this tile is being placed back to the deck
				// we remove it from its previous group
				this.stateManager
					.removeTileFromGroup(this.tile)
					.removePlacedTile(this.tile);
				this.tile.tileGroup = null;
			}
		} else {
			this.stateManager.addPlacedTile(this.tile);

			if (this.tile.tileGroup) {
				// this tile is moved from its previous group to another group
				// possibly a new group of its own
				this.stateManager.removeTileFromGroup(this.tile);
			}

			if (this.snapToTile) {
				// this tile will snap to another tile

				const newGroup = this.stateManager.getTileGroup(this.snapToTile);
				// determine if this tile will snap to the left or to the right of
				// the target tile (this.snapToTile)
				const snapToLeft = this.snapPosition![0] < this.snapToTile.position![0];

				if (snapToLeft) {
					// we need to find out if there are any other tiles
					// right next to the position that this tile will snap to
					//
					// if there are, that means this tile will snap to a position
					// which is in between two tiles.
					// so the groups of the two tiles will unify into one single group

					const snapPositionLeft = [
						this.snapPosition![0] - TILE_WIDTH,
						this.snapPosition![1],
					];

					let hasUpdatedGroup = false;

					for (const [, placedTile] of this.stateManager.placedTiles) {
						if (
							placedTile.position![0] === snapPositionLeft[0] &&
							placedTile.position![1] === snapPositionLeft[1]
						) {
							// unify two groups

							hasUpdatedGroup = true;

							const leftGroup = this.stateManager.getTileGroup(placedTile);
							const leftGroupID = placedTile.tileGroup!;

							for (const tile of leftGroup) {
								tile.tileGroup = this.snapToTile.tileGroup;
							}

							this.stateManager.tileGroups
								.set(this.snapToTile.tileGroup!, [
									...leftGroup,
									this.tile,
									...newGroup,
								])
								.delete(leftGroupID);

							break;
						}
					}

					if (!hasUpdatedGroup) {
						// this tile will not be in between any two tiles
						// so we just add this tile to the group of the target tile
						this.stateManager.tileGroups.set(this.snapToTile.tileGroup!, [
							this.tile,
							...newGroup,
						]);
					}
				} else {
					// same logic as above
					// except this is the case in which this tile will snap to the right
					// of the target tile
					// haven't found a way to unify these two cases yet.

					const snapPositionRight = [
						this.snapPosition![0] + TILE_WIDTH,
						this.snapPosition![1],
					];

					let hasUpdatedGroup = false;

					for (const [, placedTile] of this.stateManager.placedTiles) {
						if (
							placedTile.position![0] === snapPositionRight[0] &&
							placedTile.position![1] === snapPositionRight[1]
						) {
							hasUpdatedGroup = true;

							const rightGroup = this.stateManager.getTileGroup(placedTile);
							const rightGroupID = placedTile.tileGroup!;

							for (const tile of rightGroup) {
								tile.tileGroup = this.snapToTile.tileGroup;
							}

							this.stateManager.tileGroups
								.set(this.snapToTile.tileGroup!, [
									...newGroup,
									this.tile,
									...rightGroup,
								])
								.delete(rightGroupID);

							break;
						}
					}

					if (!hasUpdatedGroup) {
						// this tile will not be in between any two tiles
						// so we just add this tile to the group of the target tile
						this.stateManager.tileGroups.set(this.snapToTile.tileGroup!, [
							...newGroup,
							this.tile,
						]);
					}
				}

				this.tile.tileGroup = this.snapToTile.tileGroup;
			} else {
				// extremely simple case
				// the tile forms a group of its own
				// not snapping to any tiles
				this.stateManager.addTileGroup([this.tile]);
			}
		}

		console.log('placed tiles', this.stateManager.tileGroups);
	}

	onMouseOver = () => {
		this.tile.renderObject!.tint = 0xf7f6eb;
	};

	onMouseOut = () => {
		if (!this.isSelected) {
			this.tile.renderObject!.tint = 0xffffff;
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
				const movedTiles = [];
				// this tile is in a selection group
				// move all selected tiles
				for (const tile of this.stateManager.selectedTiles) {
					const x = tile.renderObject!.x + domEvent.movementX;
					const y = tile.renderObject!.y + domEvent.movementY;

					tile.renderObject!.x = x;
					tile.renderObject!.y = y;
					tile.position![0] = x;
					tile.position![1] = y;

					movedTiles.push({
						tileID: tile.id,
						coordinate: tile.position!,
					});
				}

				if (this.tile.tileGroup) {
					this.communicator.notify(GameEvent.ON_TILE_MOVED, movedTiles);
				}
			} else {
				const x = this.tile.renderObject!.x + domEvent.movementX;
				const y = this.tile.renderObject!.y + domEvent.movementY;

				this.tile.renderObject!.x = x;
				this.tile.renderObject!.y = y;
				this.tile.position![0] = x;
				this.tile.position![1] = y;

				if (this.tile.tileGroup) {
					this.communicator.notify(GameEvent.ON_TILE_MOVED, [
						{
							tileID: this.tile.id,
							coordinate: this.tile.position!,
						},
					]);
				}

				const canSnap = this.findSnapArea();

				if (!canSnap) {
					this.gameRenderer.clearSnapIndicator(this.snapIndicator);
					this.snapPosition = null;
					this.snapToTile = null;
				}
			}
		}
	};

	onMouseUp = () => {
		this.gameRenderer.clearSnapIndicator(this.snapIndicator);
		this.snapIndicator = null;

		// snap this tile to snap area
		if (this.snapPosition) {
			this.tile.renderObject!.position.set(
				this.snapPosition[0],
				this.snapPosition[1]
			);
			this.tile.position = this.snapPosition;
			this.communicator.notify(GameEvent.ON_TILE_MOVED, [
				{
					tileID: this.tile.id,
					coordinate: this.tile.position,
				},
			]);
		}

		// if this tile has not been moved, select it
		if (!this.isMoved) {
			this.isSelected = !this.isSelected;
			this.tile.renderObject!.tint = this.isSelected
				? 0xf7f6eb
				: TILE_BACKGROUND_COLOR;

			if (this.isSelected) {
				this.stateManager.selectedTiles.add(this.tile);
			} else {
				this.stateManager.selectedTiles.delete(this.tile);
			}
		} else {
			this.isMoved = false;
			this.placeTile();
		}

		this.snapPosition = null;
		this.snapToTile = null;
		this.isDragging = false;
		this.data = null;
	};
}

export default TileInteractivity;
