import React from 'react';
import { Provider } from 'react-redux';

import store from '../store';
import ActivePage from './App';

function App() {
	return (
		<React.StrictMode>
			<Provider store={store}>
				<ActivePage />
			</Provider>
		</React.StrictMode>
	);
}

export default App;
