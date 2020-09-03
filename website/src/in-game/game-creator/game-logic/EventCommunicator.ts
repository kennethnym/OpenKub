import { Coordinate } from './types';

enum GameEvent {
	ON_TILE_MOVED = 'on_tile_moved',
}

type EventArgument = {
	[GameEvent.ON_TILE_MOVED]: {
		tileID: number;
		coordinate: Coordinate;
	}[];
};

type EventCallback<T> = (arg: T) => void;

/**
 * EventCommunicator handles game events
 */
class EventCommunicator {
	private callbacks = new Map<
		GameEvent,
		Set<EventCallback<EventArgument[GameEvent]>>
	>();

	addEventListener<T extends GameEvent>(
		event: T,
		callback: EventCallback<EventArgument[T]>
	) {
		if (this.callbacks.has(event)) {
			this.callbacks.get(event)!.add(callback);
		} else {
			this.callbacks.set(
				event,
				new Set<EventCallback<EventArgument[T]>>([callback])
			);
		}
	}

	removeEventListener<T extends GameEvent>(
		event: T,
		callback: EventCallback<EventArgument[T]>
	) {
		this.callbacks.get(event)!.delete(callback);
	}

	notify<T extends GameEvent>(event: T, arg: EventArgument[T]) {
		if (this.callbacks.has(event)) {
			for (const cb of this.callbacks.get(event)!) {
				cb(arg);
			}
		}
	}
}

export default EventCommunicator;
export { GameEvent };
