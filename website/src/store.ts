import { configureStore } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import PlayerStore from './common/api/player/store';
import Player from './common/api/player/player';
import AppStore, { AppState } from './app/store';

/**
 * Describes the shape of the application-wide store
 */
export interface RootStore {
	app: AppState;
	player: Player;
}

/**
 * The root store that holds application-wide state like the current player.
 */
const store = configureStore({
	reducer: {
		app: AppStore.reducer,
		player: PlayerStore.reducer,
	},
});

/**
 * Same as useSelector, but with RootStore type parameter passed
 */
function useRootSelector<T>(
	selector: (state: RootStore) => T,
	comparator?: (left: T, right: T) => boolean
) {
	return useSelector<RootStore, T>(selector, comparator);
}

export default store;
export { useRootSelector };
