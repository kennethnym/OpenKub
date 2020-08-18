import reducer from './reducer';
import * as actions from './actions';
import * as selectors from './selectors';

const PlayerStore = {
	reducer,
	actions,
	...selectors,
};

export default PlayerStore;
