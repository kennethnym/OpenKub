import { createAction } from '@reduxjs/toolkit';

import { Page } from '../pages';

const changePage = createAction<Page>('CHANGE_PAGE');

const initializeSocketIO = createAction('INITIALIZE_SOCKET_IO');

export { changePage, initializeSocketIO };
