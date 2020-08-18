/**
 * Player describes a player in the game
 */
interface Player {
	id: number;
	username: string;
	relationships: Relationship[];
}

type RelationshipType = 'FRIEND' | 'BLOCKED';

/**
 * Relationship describes a relationship between a player and another player
 */
export interface Relationship<T extends RelationshipType = RelationshipType> {
	to: Player;
	type: T;
}

export default Player;
