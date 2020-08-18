import { createReducer } from '@reduxjs/toolkit';

import { setPlayer } from './actions';

const reducer = createReducer(
	{},
	{
		[setPlayer.type]: (state, action) => action.payload,
	}
);

export default reducer;
