import type Player from '../player';

// javascript doesn't allow numbers as keys of objects,
// and we can't put Map() in redux state, playersReady and players

interface GameRoom {
	id: string;
	playersReady: { [playerID: string]: boolean };
	players: Partial<{ [playerID: string]: Player }>;
	hostedBy: Player;
	currentTurnPlayerID: number;
}

export default GameRoom;
