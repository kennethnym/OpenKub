import React from 'react';

import Player, { PlayerStore } from 'src/common/api/player';
import { useRootSelector } from 'src/store';

import Header from '../components/Header';
import FriendList from './FriendList';

function FriendsPage() {
	const playerFriends = useRootSelector<Player[]>(
		PlayerStore.selectPlayerFriends
	);

	return (
		<div className="flex flex-col w-full px-8 lg:w-1/2 lg:px-0">
			<Header>Your friends</Header>
			{playerFriends.length === 0 ? (
				<p>You currently have no friends.</p>
			) : (
				<FriendList friends={playerFriends} />
			)}
		</div>
	);
}

export default FriendsPage;
