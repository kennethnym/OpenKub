import { createAction } from '@reduxjs/toolkit';

import GameRoom from '../game-room';
import Player from '../../player';

const initialize = createAction<GameRoom>('INITIALIZE_GAME_ROOM');

const addPlayer = createAction<Player>('GAME_ROOM/ADD_PLAYER');

const removePlayerByID = createAction<number>('GAME_ROOM/REMOVE_PLAYER_BY_ID');

const changeHostByID = createAction<number>('GAME_ROOM/CHANGE_HOST_BY_ID');

const readyPlayerByID = createAction<number>('GAME_ROOM/READY_PLAYER_BY_ID');

const unreadyPlayerByID = createAction<number>(
	'GAME_ROOM/UNREADY_PLAYER_BY_ID'
);

const nextTurn = createAction<number>('GAME_ROOM/NEXT_TURN');

export {
	addPlayer,
	changeHostByID,
	readyPlayerByID,
	unreadyPlayerByID,
	removePlayerByID,
	initialize,
	nextTurn,
};
