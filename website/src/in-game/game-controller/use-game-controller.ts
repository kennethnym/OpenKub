import { useEffect, useRef, useState } from 'react';

import { GameRenderer, EventCommunicator } from './game-logic';
import GameStateManager from './game-logic/GameStateManager';

function useGameController() {
	const gameStateManager = useRef<GameStateManager>(new GameStateManager());
	const eventCommunicatorRef = useRef<Nullable<EventCommunicator>>(null);
	const [renderer, setRenderer] = useState<Nullable<GameRenderer>>(null);

	useEffect(() => {
		const eventCommunicator = new EventCommunicator();
		eventCommunicatorRef.current = eventCommunicator;

		setRenderer(
			new GameRenderer({
				communicator: eventCommunicator,
				stateManager: gameStateManager.current,
			})
		);
	}, []);

	return {
		renderer,
		eventCommunicator: eventCommunicatorRef.current,
		gameStateManager: gameStateManager.current,
	};
}

export default useGameController;
