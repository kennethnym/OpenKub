import React from 'react';
import { Provider } from 'react-redux';

import store from 'src/store';
import { SocketProvider } from 'src/common/api/socket';

import ActivePage from './App';

function App() {
	return (
		<React.StrictMode>
			<SocketProvider>
				<Provider store={store}>
					<ActivePage />
				</Provider>
			</SocketProvider>
		</React.StrictMode>
	);
}

export default App;
