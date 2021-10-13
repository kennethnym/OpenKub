import type { Coordinate, Rect } from '../types';

function isPointInRect(point: Coordinate, rect: Rect) {
	return (
		point[0] > rect.topLeft[0] &&
		point[0] < rect.bottomRight[0] &&
		point[1] > rect.topLeft[1] &&
		point[1] < rect.bottomRight[1]
	);
}

export default isPointInRect;
