import { createSelector } from '@reduxjs/toolkit';

import type { RootStore } from '../../store';
import type { Page } from '../pages';
import type { AppState } from './type';

const selectActivePage = createSelector<RootStore, AppState, Page>(
	(state) => state.app,
	(appState) => appState.activePage
);

const selectSocket = createSelector<
	RootStore,
	Nullable<SocketIOClient.Socket>,
	Nullable<SocketIOClient.Socket>
>(
	(state) => state.app.socket,
	(socket) => socket
);

export { selectActivePage, selectSocket };
