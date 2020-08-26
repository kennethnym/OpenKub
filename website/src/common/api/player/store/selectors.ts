import { createSelector, Selector } from '@reduxjs/toolkit';

import { RootStore } from 'src/store';

import Player, { Relationship } from '../player';

function isFriend(
	relationship: Relationship
): relationship is Relationship<'FRIEND'> {
	return relationship.type === 'FRIEND';
}

const selectPlayer: Selector<RootStore, Player> = (state) => state.player;

const selectPlayerID = createSelector(selectPlayer, (player) => player.id);

/**
 * Selects players that are friends of the current player
 */
const selectPlayerFriends = createSelector(selectPlayer, (player) =>
	player.relationships
		.filter<Relationship<'FRIEND'>>(isFriend)
		.map((relationship) => relationship.to)
);

/**
 * Selects friends of the current player that are also online
 */
const selectOnlineFriends = createSelector(selectPlayerFriends, (friends) =>
	friends.filter((friend) => friend.isOnline)
);

export {
	selectPlayer,
	selectPlayerID,
	selectPlayerFriends,
	selectOnlineFriends,
};
