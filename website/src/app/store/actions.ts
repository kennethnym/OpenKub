import { createAction } from '@reduxjs/toolkit';

import { Page } from '../pages';

const changePage = createAction<Page>('CHANGE_PAGE');

export { changePage };
