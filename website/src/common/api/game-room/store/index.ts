import * as actions from './actions';
import * as selectors from './selectors';
import reducer from './reducer';

const GameRoomStore = {
	actions,
	reducer,
	...selectors,
};

export default GameRoomStore;
