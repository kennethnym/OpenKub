import { createSelector } from '@reduxjs/toolkit';
import { RootStore } from '../../store';
import { Page } from '../pages';
import { AppState } from './type';

const selectActivePage = createSelector<RootStore, AppState, Page>(
	(state) => state.app,
	(appState) => appState.activePage
);

export { selectActivePage };
