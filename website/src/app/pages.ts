import Landing from '../landing';
import Home from '../home';
import InGame from '../in-game';

enum Page {
	LANDING = 'LANDING',
	HOME = 'HOME',
	IN_GAME = 'IN_GAME',
}

const PAGES: { [K in keyof typeof Page]: () => JSX.Element } = {
	[Page.LANDING]: Landing,
	[Page.HOME]: Home,
	[Page.IN_GAME]: InGame,
};

export { Page, PAGES };
