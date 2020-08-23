import { Slide, toast, ToastContainer } from 'react-toastify';
import React, { ReactNode, useEffect, useState } from 'react';
import isEmpty from 'lodash.isempty';

import Player, { PlayerStore } from 'src/common/api/player';
import { useSocket } from 'src/common/api/socket';
import { useRootSelector } from 'src/store';

import GameRoom from './GameRoom';

const Context = React.createContext<Partial<GameRoom>>({});

interface GameRoomProviderProps {
	initialGame?: GameRoom;
	children: ReactNode;
}

function GameRoomProvider({ initialGame, children }: GameRoomProviderProps) {
	const player = useRootSelector(PlayerStore.selectPlayer);
	const [gameRoom, setGameRoom] = useState<Partial<GameRoom>>(
		initialGame ?? {}
	);
	const { socket } = useSocket();

	useEffect(() => {
		if (isEmpty(gameRoom) && !initialGame) {
			socket?.on('game_created', (roomJSON: string) => {
				console.log('created');
				setGameRoom(new GameRoom(roomJSON));
			});

			socket?.emit('create_game');
		}

		const kickPlayerEvent = `${gameRoom.id}:kick_player`;
		const playerJoinedEvent = `${gameRoom.id}:player_joined`;
		const playerReadyEvent = `${gameRoom.id}:player_ready`;
		const playerUnreadyEvent = `${gameRoom.id}:player_unready`;
		const playerLeftEvent = `${gameRoom.id}:player_left`;
		const newHostEvent = `${gameRoom.id}:new_host`;
		const startGameEvent = `${gameRoom.id}:start_game`;

		socket
			?.on(playerJoinedEvent, (playerJSON: string) => {
				setGameRoom({
					...gameRoom.addPlayer!(JSON.parse(playerJSON) as Player),
				});
			})
			?.on(kickPlayerEvent, (playerID: number) => {
				setGameRoom({
					...gameRoom.kickPlayer!(playerID),
				});
			})
			?.on(playerReadyEvent, (playerID: number) => {
				setGameRoom({
					...gameRoom.readyPlayer!(playerID),
				});
			})
			?.on(playerUnreadyEvent, (playerID: number) => {
				setGameRoom({
					...gameRoom.unreadyPlayer!(playerID),
				});
			})
			?.on(playerLeftEvent, (playerID: number) => {
				const player = gameRoom.players![playerID]!;

				toast.info(`${player.username} left the game.`);
				setGameRoom({
					...gameRoom.kickPlayer!(playerID),
				});
			})
			?.on(newHostEvent, (hostID: number) => {
				if (player.id === hostID) {
					toast.info('You are now the host of this game.');
				}

				setGameRoom({
					...gameRoom.changeHost!(hostID),
				});
			})
			?.on(startGameEvent, () => {
				// start game
			});

		return () => {
			socket
				?.off('game_created')
				?.off(playerJoinedEvent)
				?.off(kickPlayerEvent)
				?.off(playerReadyEvent)
				?.off(playerUnreadyEvent)
				?.off(playerLeftEvent)
				?.off(newHostEvent)
				?.off(startGameEvent);
		};
	}, [socket, gameRoom, initialGame, player.id]);

	return (
		<Context.Provider value={gameRoom}>
			<>
				<ToastContainer transition={Slide} />
				{children}
			</>
		</Context.Provider>
	);
}

GameRoomProvider.Context = Context;

export default GameRoomProvider;
