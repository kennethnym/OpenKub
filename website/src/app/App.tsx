import React from 'react';

import type { Page } from './pages';
import { PAGES } from './pages';
import AppStore from './store';
import { useRootSelector } from '../store';

/**
 * Renders the current page
 */
function ActivePage() {
	const activePage = useRootSelector<Page>(AppStore.selectActivePage);
	const PageComponent = PAGES[activePage];

	return <PageComponent />;
}

export default ActivePage;
