import { createReducer } from '@reduxjs/toolkit';
import io from 'socket.io-client';

import { SERVER_URL } from 'src/common/api';

import type { AppState } from './type';
import { Page } from '../pages';
import { changePage, initializeSocketIO } from './actions';

const initialState: AppState = {
	activePage: Page.LANDING,
	socket: null,
};

const reducer = createReducer(initialState, {
	[changePage.type]: (state, action) => {
		state.activePage = action.payload;
	},
	[initializeSocketIO.type]: (state) => {
		state.socket = io(SERVER_URL, {
			path: '/api/socket',
		});
	},
});

export default reducer;
