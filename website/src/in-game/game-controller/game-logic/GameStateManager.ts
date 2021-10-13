import { nanoid } from '@reduxjs/toolkit';

import type { Tile } from './types';
import { validateTiles } from './utils';

/**
 * GameStateManager keep tracks of and manages internal game state
 */
class GameStateManager {
	public selectedTiles = new Set<Tile>();
	public renderedTiles = new Map<number, Tile>();
	public placedTiles = new Map<number, Tile>();
	public tileGroups = new Map<string, Tile[]>();
	public invalidGroups = new Set<string>();

	/**
	 * Keeps track of a rendered tile
	 * @param tile
	 */
	addRenderedTile(tile: Tile) {
		this.renderedTiles.set(tile.id, tile);
		return this;
	}

	/**
	 * Keeps track of a placed tile
	 * @param tile
	 */
	addPlacedTile(tile: Tile) {
		this.placedTiles.set(tile.id, tile);
		return this;
	}

	/**
	 * Forgets a placed tile. Actual remove logic is in TileInteractivity.placeTile
	 * @param tile
	 */
	removePlacedTile(tile: Tile) {
		this.placedTiles.delete(tile.id);
		return this;
	}

	/**
	 * Removes tile from its tile group
	 * @param tile
	 */
	removeTileFromGroup(tile: Tile) {
		if (!tile.tileGroup) {
			throw new Error('Tile is not in any tile group.');
		}

		const prevGroup = this.getTileGroup(tile);

		if (prevGroup.length === 1) {
			// we assume the tile is in the group
			// and it is the remaining member in the group
			this.tileGroups.delete(tile.tileGroup);
			return this;
		}

		// when a tile is removed from a group
		// 2-3 new groups are created on the left and on the right
		//
		// for example:
		//
		//
		// [] = tile
		//
		// prevGroupIndex is 2
		//
		// left     right <-- three new groups are created
		// ----- -- -----
		// [] [] [] [] []
		//       ^^
		//       suppose this is the tile to be removed.
		//       it will form a group of its own
		//
		// example 2: only two groups are created.
		//
		// prevGroupIndex is 0.
		// leftGroup.length is 0.
		//
		//    right    <-- two new groups are created
		// -- --------
		// [] [] [] []
		// ^^
		// remove this.

		const prevGroupIndex = prevGroup.findIndex(({ id }) => id === tile.id);
		const leftGroup = prevGroup.slice(0, prevGroupIndex);
		const rightGroup = prevGroup.slice(prevGroupIndex + 1);

		if (leftGroup.length > 0) {
			if (rightGroup.length > 0) {
				const newGroupID = nanoid();

				this.tileGroups.set(newGroupID, rightGroup);

				for (const tile of rightGroup) {
					tile.tileGroup = newGroupID;
				}
			}
			this.tileGroups.set(tile.tileGroup, leftGroup);
		} else {
			this.tileGroups.set(tile.tileGroup, rightGroup);
		}

		return this;
	}

	getTileGroup(tile: Tile) {
		if (!tile.tileGroup) {
			throw new Error('tile is not in any tile group.');
		}
		return this.tileGroups.get(tile.tileGroup)!;
	}

	addTileGroup(tiles: Tile[]) {
		const newGroupID = nanoid();

		this.tileGroups.set(newGroupID, tiles);

		for (const tile of tiles) {
			tile.tileGroup = newGroupID;
		}

		return this;
	}

	isTileSelected(tile: Tile) {
		return this.selectedTiles.has(tile);
	}

	/**
	 * Validates all the placed tiles
	 */
	validateTiles() {
		this.invalidGroups = validateTiles(this.tileGroups);
	}
}

export default GameStateManager;
