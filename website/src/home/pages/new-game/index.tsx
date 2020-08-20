import React from 'react';

import Header from '../components/Header';
import PlayerList from './player-list';

function NewGamePage() {
	return (
		<div className="flex flex-col w-full px-8 lg:w-1/2 lg:px-0">
			<Header>New game</Header>
			<PlayerList players={[]} />
		</div>
	);
}

export default NewGamePage;
