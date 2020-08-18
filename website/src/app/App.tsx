import React from 'react';

import AppStore from './store';
import { useRootSelector } from '../store';
import { Page, PAGES } from './pages';

/**
 * Renders the current page
 */
function ActivePage() {
	const activePage = useRootSelector<Page>(AppStore.selectActivePage);
	const PageComponent = PAGES[activePage];

	return <PageComponent />;
}

export default ActivePage;
