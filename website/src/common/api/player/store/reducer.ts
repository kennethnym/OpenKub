import { createReducer } from '@reduxjs/toolkit';

import type Player from '../player';
import { changePlayerOnlineStatus, setPlayer } from './actions';

const reducer = createReducer<Nullable<Player>>(null, {
	[setPlayer.type]: (state, action) => action.payload,
	[changePlayerOnlineStatus.type]: (state, action) => {
		const i = state!.relationships.findIndex(
			(relationship) => relationship.to.id === action.payload.playerID
		);

		state!.relationships[i].to.isOnline = action.payload.isOnline;
	},
});

export default reducer;
