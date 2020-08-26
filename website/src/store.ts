import { configureStore } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import Player, { PlayerStore } from './common/api/player';
import GameRoom, { GameRoomStore } from './common/api/game-room';
import AppStore, { AppState } from './app/store';

/**
 * Describes the shape of the application-wide store
 *
 * The values come from the initial states of their corresponding reducers.
 * However, their types do not match the types of their initial states
 * defined in their corresponding reducers (initial states of reducers are Nullable,
 * here the types of the values are NOT nullable).
 *
 * In practice, the values are never accessed when they are null (player object
 * will not be accessed until the user is logged in; gameRoom object will never
 * be accessed until the user creates a game; etc.). The reason why the initial
 * states of the reducers are nullable is that the initialState param of
 * createReducer must be passed, and I choose to pass in null.
 *
 * If the values here are also Nullable, then I have to deal with null checks in
 * selectors, which unnecessarily clutters up code
 */
export interface RootStore {
	app: AppState;
	player: Player;
	gameRoom: GameRoom;
}

/**
 * The root store that holds application-wide state like the current player.
 */
const store = configureStore({
	reducer: {
		app: AppStore.reducer,
		player: PlayerStore.reducer,
		gameRoom: GameRoomStore.reducer,
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
