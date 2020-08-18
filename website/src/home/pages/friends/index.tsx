import React from 'react';

import Player, { PlayerStore } from 'src/common/api/player';
import { useRootSelector } from 'src/store';

import FriendList from './FriendList';

function FriendsPage() {
	const playerFriends = useRootSelector<Player[]>(
		PlayerStore.selectPlayerFriends
	);

	return (
		<div className="flex flex-col w-full px-8 lg:w-1/2 lg:px-0">
			<h1 className="text-4xl font-bold mb-8">Your friends</h1>
			{playerFriends.length === 0 ? (
				<p>You currently have no friends.</p>
			) : (
				<FriendList friends={playerFriends} />
			)}
		</div>
	);
}

export default FriendsPage;
