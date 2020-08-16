import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

import Landing from './landing';
import * as serviceWorker from './serviceWorker';
import './index.out.css';

function Root() {
	return (
		<React.StrictMode>
			<Router>
				<Switch>
					<Route path="/">
						<Landing />
					</Route>
				</Switch>
			</Router>
		</React.StrictMode>
	);
}

ReactDOM.render(<Root />, document.getElementById('root'));
serviceWorker.unregister();
