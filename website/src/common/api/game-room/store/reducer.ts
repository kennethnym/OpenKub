import { createReducer } from '@reduxjs/toolkit';

import GameRoom from '../game-room';
import {
	addPlayer,
	changeHostByID,
	initialize,
	nextTurn,
	readyPlayerByID,
	removePlayerByID,
	unreadyPlayerByID,
} from './actions';

// null is a bitch
const reducer = createReducer<Nullable<GameRoom>>(null, {
	[initialize.type]: (state, action) => action.payload,
	[addPlayer.type]: (state, action) => {
		if (state) {
			state.players[action.payload.id.toString()] = action.payload;
		}
	},
	[removePlayerByID.type]: (state, action) => {
		if (state) {
			delete state.players[action.payload.toString()];
			delete state.playersReady[action.payload.toString()];
		}
	},
	[changeHostByID.type]: (state, action) => {
		if (state) {
			state.hostedBy =
				state.players[action.payload.toString()] ?? state.hostedBy;
		}
	},
	[readyPlayerByID.type]: (state, action) => {
		if (state) {
			state.playersReady[action.payload.toString()] = true;
		}
	},
	[unreadyPlayerByID.type]: (state, action) => {
		if (state) {
			delete state.playersReady[action.payload.toString()];
		}
	},
	[nextTurn.type]: (state, action) => {
		if (state) {
			state.currentTurnPlayerID = action.payload;
		}
	},
});

export default reducer;
