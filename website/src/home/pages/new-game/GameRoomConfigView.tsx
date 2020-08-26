import React from 'react';

import { GameRoomStore } from 'src/common/api/game-room';
import { PlayerStore } from 'src/common/api/player';
import { Button } from 'src/common/components';
import { useSocket } from 'src/common/api/socket';
import { useRootSelector } from 'src/store';

import PlayerList from './player-list';

function GameRoomConfigView() {
	const gameRoom = useRootSelector(GameRoomStore.selectGameRoom)!;
	const isPlayerReady = useRootSelector(GameRoomStore.isPlayerReady);
	const isPlayerHosting = useRootSelector(GameRoomStore.isPlayerHosting);
	const canStartGame = useRootSelector(GameRoomStore.canStartGame);
	const playerID = useRootSelector(PlayerStore.selectPlayerID);
	const { socket } = useSocket();

	function readyPlayer() {
		socket?.emit(
			isPlayerReady ? 'player_unready' : 'player_ready',
			gameRoom!.id,
			playerID
		);
	}

	function startGame() {
		socket?.emit('start_game', gameRoom.id);
	}

	return (
		<>
			<PlayerList />
			<div className="flexGameRoom-auto" />
			<div className="flex space-x-4 self-stretch justify-end">
				<Button onClick={readyPlayer}>
					{isPlayerReady ? 'Unready' : 'Ready'}
				</Button>
				{isPlayerHosting && (
					<Button disabled={!canStartGame} onClick={startGame}>
						Start game
					</Button>
				)}
			</div>
		</>
	);
}

export default GameRoomConfigView;
