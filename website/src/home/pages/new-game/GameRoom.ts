import Player from 'src/common/api/player';

class GameRoom {
	id: string;
	playersReady: Set<number>;
	// the reason why id is string is because
	// go marshals maps with int keys into json objects with string keys
	players: Partial<{ [id: string]: Player }>;
	hostedBy: Player;

	/**
	 * Creates a GameRoom from its json
	 * @param roomJSON
	 */
	constructor(roomJSON: string) {
		const room = JSON.parse(roomJSON);

		this.id = room.id;
		this.players = room.players;
		this.hostedBy = room.hostedBy;
		this.playersReady = new Set(
			Object.keys(room.playersReady).map((playerID) => Number(playerID))
		);
	}

	addPlayer = (player: Player) => {
		this.players[player.id] = player;
		return this;
	};

	kickPlayer = (playerID: number) => {
		delete this.players[playerID];
		this.playersReady.delete(playerID);
		return this;
	};

	readyPlayer = (playerID: number) => {
		this.playersReady.add(playerID);
		return this;
	};

	unreadyPlayer = (playerID: number) => {
		this.playersReady.delete(playerID);
		return this;
	};

	changeHost = (hostID: number) => {
		this.hostedBy = this.players[hostID.toString()]!;
		return this;
	};

	isAllPlayersReady = () => {
		console.log('this.playersReady.size', this.playersReady.size);
		return this.playersReady.size === 4;
	};

	isHost = (player: Player): boolean => player.id === this.hostedBy.id;

	isPlayerReady = (player: Player): boolean => {
		console.log('playersReady', this.playersReady);
		return this.playersReady.has(player.id);
	};
}

export default GameRoom;
