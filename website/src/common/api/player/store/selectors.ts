import { createSelector } from '@reduxjs/toolkit';

import { RootStore } from 'src/store';

import Player, { Relationship } from '../player';

function isFriend(
	relationship: Relationship
): relationship is Relationship<'FRIEND'> {
	return relationship.type === 'FRIEND';
}

const selectPlayer = createSelector<RootStore, Player, Player>(
	(state) => state.player,
	(player) => player
);

/**
 * Selects players that are friends of the current player
 */
const selectPlayerFriends = createSelector<RootStore, Relationship[], Player[]>(
	(state) => state.player.relationships,
	(relationships) =>
		relationships
			.filter<Relationship<'FRIEND'>>(isFriend)
			.map((relationship) => relationship.to)
);

/**
 * Selects friends of the current player that are also online
 */
const selectOnlineFriends = createSelector<RootStore, Player[], Player[]>(
	selectPlayerFriends,
	(friends) => friends.filter((friend) => friend.isOnline)
);

export { selectPlayer, selectPlayerFriends, selectOnlineFriends };
