import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';

import AppStore from 'src/app/store';
import { Page } from 'src/app/pages';
import { GameRoomStore } from 'src/common/api/game-room';
import { PlayerStore } from 'src/common/api/player';
import { useSocket } from 'src/common/api/socket';
import { useRootSelector } from 'src/store';

import Header from '../components/Header';
import GameRoomConfigView from './GameRoomConfigView';

function NewGamePage() {
	const isGameRoomCreated = useRootSelector(GameRoomStore.isGameRoomCreated);
	const gameRoomID = useRootSelector(GameRoomStore.selectGameRoomID);
	const gamePlayers = useRootSelector(GameRoomStore.selectPlayersInRoom);
	const player = useRootSelector(PlayerStore.selectPlayer);
	const { socket } = useSocket();
	const dispatch = useDispatch();

	useEffect(() => {
		if (!isGameRoomCreated) {
			socket?.on('game_created', (roomJSON: string) => {
				console.log('asd', roomJSON);
				dispatch(GameRoomStore.actions.initialize(JSON.parse(roomJSON)));
			});

			socket?.emit('create_game');

			return;
		}

		const kickPlayerEvent = `${gameRoomID}:kick_player`;
		const playerJoinedEvent = `${gameRoomID}:player_joined`;
		const playerReadyEvent = `${gameRoomID}:player_ready`;
		const playerUnreadyEvent = `${gameRoomID}:player_unready`;
		const playerLeftEvent = `${gameRoomID}:player_left`;
		const newHostEvent = `${gameRoomID}:new_host`;
		const startGameEvent = `${gameRoomID}:start_game`;
		const deckDistributedEvent = `${gameRoomID}:deck_distributed`;

		socket
			?.on(playerJoinedEvent, (playerJSON: string) => {
				dispatch(GameRoomStore.actions.addPlayer(JSON.parse(playerJSON)));
			})
			?.on(kickPlayerEvent, (playerID: number) => {
				console.log('kick player ', playerID);
				dispatch(GameRoomStore.actions.removePlayerByID(playerID));
			})
			?.on(playerReadyEvent, (playerID: number) => {
				dispatch(GameRoomStore.actions.readyPlayerByID(playerID));
			})
			?.on(playerUnreadyEvent, (playerID: number) => {
				dispatch(GameRoomStore.actions.unreadyPlayerByID(playerID));
			})
			?.on(playerLeftEvent, (playerID: number) => {
				const player = gamePlayers[playerID]!;
				toast.info(`${player.username} left the game.`);
				dispatch(GameRoomStore.actions.removePlayerByID(playerID));
			})
			?.on(newHostEvent, (hostID: number) => {
				if (player.id === hostID) {
					toast.info('You are now the host of this game.');
				}
				dispatch(GameRoomStore.actions.changeHostByID(hostID));
			})
			?.on(startGameEvent, (currentTurn: number) => {
				dispatch(GameRoomStore.actions.nextTurn(currentTurn));
				dispatch(AppStore.actions.changePage(Page.IN_GAME));
			})
			?.on(deckDistributedEvent, (deckJSON: string) => {
				console.log('deck', deckJSON);
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
				?.off(startGameEvent)
				?.off(deckDistributedEvent);
		};
	}, [socket, isGameRoomCreated, gameRoomID, player.id, dispatch]);

	return (
		<div className="flex flex-col w-full px-8 pb-16 lg:w-1/2 lg:px-0">
			<Header>New game</Header>
			{isGameRoomCreated ? <GameRoomConfigView /> : <p>Contacting server...</p>}
		</div>
	);
}

export default NewGamePage;
