import FriendsPage from './pages/friends';
import NewGamePage from './pages/new-game';

/**
 * Defines tab pages in the home page
 */
enum Tab {
	FRIENDS = 'FRIENDS',
	NEW_GAME = 'NEW_GAME',
}

/**
 * Describes the properties of a tab page
 */
interface TabPage {
	page: (props: Record<string, unknown>) => JSX.Element;
	label: string;
	icon: string;
}

/**
 * Maps tabs to their corresponding pages
 */
const TAB_PAGES: { [K in keyof typeof Tab]: TabPage } = {
	[Tab.FRIENDS]: {
		page: FriendsPage,
		label: 'Friends',
		icon: 'users-alt',
	},
	[Tab.NEW_GAME]: {
		page: NewGamePage,
		label: 'New game',
		icon: 'plus-circle',
	},
};

export { TAB_PAGES, Tab };
