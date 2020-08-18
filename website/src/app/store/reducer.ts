import { createReducer } from '@reduxjs/toolkit';

import { AppState } from './type';
import { Page } from '../pages';
import { changePage } from './actions';

const initialState: AppState = {
	activePage: Page.LANDING,
};

const reducer = createReducer(initialState, {
	[changePage.type]: (state, action) => {
		state.activePage = action.payload;
	},
});

export default reducer;
