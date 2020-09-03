import { Tile } from '../types';

enum GroupType {
	GROUP,
	INCREASING_RUN,
	DECREASING_RUN,
}

/**
 * Validates if tiles are correctly arranged.
 *
 * @param tileGroups {Map<string, Tile[]>} The tile groups to be validated
 * @return {Set<string>} The set of ids of invalid groups
 */
function validateTiles(tileGroups: Map<string, Tile[]>) {
	const invalidGroups = new Set<string>();

	for (const [id, tiles] of tileGroups) {
		const tileCount = tiles.length;

		if (tileCount < 3) {
			// this tile group has less than 3 tiles
			// invalid

			invalidGroups.add(id);
			continue;
		}

		const firstTile = tiles[0];
		const secondTile = tiles[1];
		const thirdTile = tiles[2];
		const fourthTile = tiles[4];

		const jokerCount = tiles.filter(isJoker).length;

		if (tileCount === 3 && jokerCount === 2) {
			continue;
		}

		let type: GroupType;

		if (isJoker(firstTile) && isJoker(secondTile)) {
			const tileDiff = tileNumDifference(thirdTile, fourthTile);
			// check for invalid tile combinations
			if (
				isSameTiles(thirdTile, fourthTile) ||
				tileDiff > 1 ||
				(tileDiff === 1 && thirdTile.num < 3 && fourthTile.num < 4)
			) {
				invalidGroups.add(id);
				continue;
			}

			type = determineGroupType(thirdTile, fourthTile);
		} else if (isJoker(firstTile) && isJoker(thirdTile)) {
			const tileDiff = tileNumDifference(secondTile, fourthTile);

			if (
				isSameTiles(secondTile, fourthTile) ||
				(tileDiff !== 0 && tileDiff !== 2) ||
				(tileDiff === 2 &&
					((secondTile.num < 2 && fourthTile.num < 4) ||
						secondTile.color !== fourthTile.color))
			) {
				invalidGroups.add(id);
				continue;
			}

			type = determineGroupType(secondTile, fourthTile);
		} else if (isJoker(secondTile) && isJoker(thirdTile)) {
			const tileDiff = tileNumDifference(firstTile, fourthTile);

			if (
				isSameTiles(firstTile, fourthTile) ||
				(tileDiff !== 0 && tileDiff !== 3) ||
				(tileDiff === 3 && firstTile.color !== fourthTile.color)
			) {
				invalidGroups.add(id);
				continue;
			}

			type = determineGroupType(firstTile, fourthTile);
		} else if (isJoker(firstTile)) {
			const tileDiff = tileNumDifference(secondTile, thirdTile);

			if (
				isSameTiles(secondTile, thirdTile) ||
				tileDiff > 1 ||
				(tileDiff === 1 &&
					(secondTile.num < 2 || secondTile.color !== thirdTile.color))
			) {
				invalidGroups.add(id);
				continue;
			}

			type = determineGroupType(secondTile, thirdTile);
		} else if (isJoker(secondTile)) {
			const tileDiff = tileNumDifference(firstTile, thirdTile);

			if (
				isSameTiles(firstTile, thirdTile) ||
				(tileDiff !== 0 && tileDiff !== 2) ||
				(tileDiff === 2 && firstTile.color !== thirdTile.color)
			) {
				invalidGroups.add(id);
				continue;
			}

			type = determineGroupType(firstTile, thirdTile);
		} else {
			const tileDiff = tileNumDifference(firstTile, secondTile);

			if (
				isSameTiles(firstTile, secondTile) ||
				tileDiff > 1 ||
				(tileDiff === 1 && firstTile.color !== secondTile.color)
			) {
				invalidGroups.add(id);
				continue;
			}

			type = determineGroupType(firstTile, secondTile);
		}

		if (
			(type === GroupType.GROUP && tileCount > 4) ||
			!areSubsequentTilesValid({
				tileCount,
				jokerCount,
				tileGroup: tiles,
				groupType: type,
			})
		) {
			invalidGroups.add(id);
		}
	}

	return invalidGroups;
}

/**
 * Called after determining the type of a tile group by comparing the first four tiles
 * @param tileGroup {Tile[]} The tile group to be validated
 * @param tilesCount {number} The number of tiles in the group. Should already be
 * determined before this function is called.
 * @param groupType {GroupType} The type of the tile group
 * @param jokerCount {number} The number of jokers in the group
 */
function areSubsequentTilesValid({
	tileGroup,
	tileCount,
	groupType,
	jokerCount,
}: {
	tileGroup: Tile[];
	tileCount: number;
	groupType: GroupType;
	jokerCount: number;
}) {
	let startFrom;

	if (jokerCount === 2) startFrom = 4;
	else if (jokerCount === 0) startFrom = 2;
	else startFrom = 3;

	let isPrevTileJoker = isJoker(tileGroup[startFrom - 1]);

	for (let i = startFrom; i < tileCount; i++) {
		const currentTile = tileGroup[i];
		const prevTile = tileGroup[i - 1];
		const prevPrevTile = tileGroup[i - 2];

		if (isJoker(currentTile)) {
			isPrevTileJoker = true;
			continue;
		}

		isPrevTileJoker = false;

		switch (groupType) {
			case GroupType.GROUP:
				if (
					currentTile.num !== prevTile.num ||
					tileGroup.slice(0, i).some((tile) => tile.color === currentTile.color)
				) {
					return false;
				}

				break;
			case GroupType.INCREASING_RUN: {
				const tileDiff = tileNumDifference(currentTile, prevTile);

				if (currentTile.num <= prevTile.num) {
					return false;
				} else {
					if (isPrevTileJoker) {
						if (currentTile.color !== prevPrevTile.color || tileDiff !== 2) {
							return false;
						}
					} else if (currentTile.color !== prevTile.color || tileDiff !== 1) {
						return false;
					}
				}

				break;
			}
			case GroupType.DECREASING_RUN: {
				const tileDiff = tileNumDifference(currentTile, prevTile);

				if (currentTile.num >= prevTile.num) {
					return false;
				} else {
					if (isPrevTileJoker) {
						if (currentTile.color !== prevPrevTile.color || tileDiff !== 2) {
							return false;
						}
					} else if (currentTile.color !== prevTile.color || tileDiff !== 1) {
						return false;
					}
				}

				break;
			}
			default:
				return true;
		}
	}

	return true;
}

/**
 * Determines if a tile is a joker
 * @param tile {Tile} the tile to be tested
 */
function isJoker(tile: Tile) {
	return tile.num === -1;
}

/**
 * Determines if the given two tiles are the same
 * @param tile1 {Tile} The first tile
 * @param tile2 {Tile} The second tile
 */
function isSameTiles(tile1: Tile, tile2: Tile) {
	return tile1.num === tile2.num && tile1.color === tile2.color;
}

/**
 * Determines the difference between two numbers of a tile
 * @param tile1 {Tile} The first tile
 * @param tile2 {Tile} The second tile
 */
function tileNumDifference({ num: num1 }: Tile, { num: num2 }: Tile) {
	return Math.abs(num1 - num2);
}

/**
 * Determine the type of the group by comparing two consecutive tiles
 *
 * If both tiles have the same number but different colors, it's a group.
 * If they have two consecutive numbers with the same color, it's a run.
 *
 * This function assumes that tile1 and tile2 are correctly arranged. Make sure
 * appropriate checks are performed before calling this function
 */
function determineGroupType(tile1: Tile, tile2: Tile) {
	if (tile1.num === tile2.num) {
		return GroupType.GROUP;
	}

	if (tile1.num > tile2.num) {
		return GroupType.DECREASING_RUN;
	}

	return GroupType.INCREASING_RUN;
}

export default validateTiles;
