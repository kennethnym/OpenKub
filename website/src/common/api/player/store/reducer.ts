import { createReducer } from '@reduxjs/toolkit';

import { changePlayerOnlineStatus, setPlayer } from './actions';
import Player from '../player';

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
