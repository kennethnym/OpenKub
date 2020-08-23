import React, { useContext } from 'react';

import Player, { PlayerStore } from 'src/common/api/player';
import { IconButton } from 'src/common/components';
import { useRootSelector } from 'src/store';
import { useSocket } from 'src/common/api/socket';

import GameRoomProvider from '../../GameRoomContext';

function OnlineFriendsList() {
	const { socket } = useSocket();
	const gameRoom = useContext(GameRoomProvider.Context);
	const onlineFriends = useRootSelector<Player[]>(
		PlayerStore.selectOnlineFriends
	);

	function sendInvitation(toID: number) {
		return () => {
			socket?.emit('send_game_invite', toID, gameRoom.id);
		};
	}

	function renderItems() {
		if (onlineFriends.length === 0) {
			return <p className="px-4">No online friends.</p>;
		}

		return onlineFriends.map(({ id, username }) => (
			<li
				key={id}
				className="flex flex-row justify-between items-center hover:bg-gray-200 px-4 py-1"
			>
				{username}
				{id in gameRoom.players! ? (
					<p className="text-gray-500">In game</p>
				) : (
					<IconButton
						icon="plus"
						tooltip={`Invite ${username}`}
						onClick={sendInvitation(id)}
					/>
				)}
			</li>
		));
	}

	return (
		<ul className="space-y-1 overflow-scroll online-friend-list">
			{renderItems()}
		</ul>
	);
}

export default OnlineFriendsList;
