import React, { useContext } from 'react';
import isEmpty from 'lodash.isempty';

import { Button } from 'src/common/components';
import { useSocket } from 'src/common/api/socket';
import { useRootSelector } from 'src/store';
import { PlayerStore } from 'src/common/api/player';

import GameRoomProvider from './GameRoomContext';
import PlayerList from './player-list';

function GameRoomConfigView() {
	const { socket } = useSocket();
	const player = useRootSelector(PlayerStore.selectPlayer);
	const gameRoom = useContext(GameRoomProvider.Context);

	function readyPlayer() {
		socket?.emit(
			gameRoom.isPlayerReady!(player) ? 'player_unready' : 'player_ready',
			gameRoom.id,
			player.id
		);
	}

	function startGame() {
		socket?.emit('start_game', gameRoom.id);
	}

	if (isEmpty(gameRoom)) {
		return <p>Contacting server...</p>;
	}

	console.log('gameRoom', gameRoom!.playersReady!.size);

	return (
		<>
			<PlayerList />
			<div className="flex-auto" />
			<div className="flex space-x-4 self-stretch justify-end">
				<Button onClick={readyPlayer}>
					{gameRoom.isPlayerReady!(player) ? 'Unready' : 'Ready'}
				</Button>
				{gameRoom.isHost!(player) && (
					<Button disabled={!gameRoom.isAllPlayersReady!()} onClick={startGame}>
						Start game
					</Button>
				)}
			</div>
		</>
	);
}

export default GameRoomConfigView;
