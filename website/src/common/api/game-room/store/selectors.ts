import { createSelector, Selector } from '@reduxjs/toolkit';

import { RootStore } from 'src/store';

import GameRoom from '../game-room';
import Player, { PlayerStore } from '../../player';

/**
 * Selects the current game room
 */
const selectGameRoom: Selector<RootStore, Nullable<GameRoom>> = (state) =>
	state.gameRoom;

const selectRoomHost = createSelector(selectGameRoom, (room) => room!.hostedBy);

const isGameRoomCreated = createSelector(
	selectGameRoom,
	(room) => room !== null
);

const selectGameRoomID = createSelector(selectGameRoom, (room) => room!.id);

/**
 * Selects players in the game room
 */
const selectPlayersInRoom = createSelector(
	selectGameRoom,
	(room) => room!.players
);

/**
 * Determines if the current player is the host of the room
 */
const isPlayerHosting = createSelector(
	[PlayerStore.selectPlayer, selectRoomHost],
	(player, host) => player.id === host.id
);

/**
 * Selects players that are ready
 */
const selectPlayersReady = createSelector(
	selectGameRoom,
	(room) => room!.playersReady
);

/**
 * Determines if the current player is ready for the game
 */
const isPlayerReady = createSelector(
	[PlayerStore.selectPlayer, selectPlayersReady],
	(player, playersReady) => player.id.toString() in playersReady
);

/**
 * Determines if the game can be started
 */
const canStartGame = createSelector(
	selectPlayersReady,
	(playersReady) => Object.keys(playersReady).length === 4
);

export {
	selectGameRoom,
	selectRoomHost,
	selectGameRoomID,
	selectPlayersInRoom,
	selectPlayersReady,
	isPlayerHosting,
	isPlayerReady,
	isGameRoomCreated,
	canStartGame,
};
