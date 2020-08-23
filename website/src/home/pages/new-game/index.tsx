import React from 'react';

import GameRoomProvider from './GameRoomContext';
import Header from '../components/Header';
import GameRoom from './GameRoom';
import GameRoomConfigView from './GameRoomConfigView';

interface NewGamePageProps {
	initialGame?: GameRoom;
}

function NewGamePage({ initialGame }: NewGamePageProps) {
	return (
		<GameRoomProvider initialGame={initialGame}>
			<div className="flex flex-col w-full px-8 pb-16 lg:w-1/2 lg:px-0">
				<Header>New game</Header>
				<GameRoomConfigView />
			</div>
		</GameRoomProvider>
	);
}

export default NewGamePage;
