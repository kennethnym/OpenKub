import { createAction } from '@reduxjs/toolkit';

import type Player from '../player';

const setPlayer = createAction<Player>('SET_PLAYER');

const changePlayerOnlineStatus = createAction<{
	playerID: number;
	isOnline: boolean;
}>('CHANGE_PLAYER_ONLINE_STATUS');

export { changePlayerOnlineStatus, setPlayer };
