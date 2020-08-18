import reducer from './reducer';
import * as actions from './actions';
import * as selectors from './selectors';

const AppStore = {
	reducer,
	actions,
	...selectors,
};

export default AppStore;
export * from './type';
