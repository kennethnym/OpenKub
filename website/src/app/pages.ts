import Landing from '../landing';
import Home from '../home';

enum Page {
	LANDING = 'LANDING',
	HOME = 'HOME',
}

const PAGES: { [K in keyof typeof Page]: () => JSX.Element } = {
	[Page.LANDING]: Landing,
	[Page.HOME]: Home,
};

export { Page, PAGES };
