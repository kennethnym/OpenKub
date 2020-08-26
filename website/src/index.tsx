import React from 'react';
import ReactDOM from 'react-dom';
import { enableMapSet } from 'immer';

import 'react-toastify/dist/ReactToastify.css';
import 'tippy.js/dist/tippy.css';

import * as serviceWorker from './serviceWorker';
import './index.out.css';
import App from './app';

enableMapSet();

const root = document.getElementById('root');

ReactDOM.render(<App />, root);
serviceWorker.unregister();

// credit to https://chrisshepherd.me/posts/adding-hot-module-reloading-to-create-react-app
if (module.hot) {
	module.hot.accept();
}
