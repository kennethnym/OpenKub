import isPointInRect from './is-point-in-rect';
import { Rect } from '../types';

// mmmmm spaghetti
function isRectInRect(rect1: Rect, rect2: Rect) {
	return (
		isPointInRect(rect1.topLeft, rect2) ||
		isPointInRect(rect1.bottomRight, rect2) ||
		(rect1.topLeft[0] > rect2.topLeft[0] &&
			rect1.topLeft[0] < rect2.bottomRight[0] &&
			rect1.bottomRight[1] > rect2.topLeft[1] &&
			rect1.bottomRight[1] < rect2.bottomRight[1]) ||
		(rect1.bottomRight[0] > rect2.topLeft[0] &&
			rect1.bottomRight[0] < rect2.bottomRight[0] &&
			rect1.topLeft[1] > rect2.topLeft[1] &&
			rect1.topLeft[1] < rect2.bottomRight[1])
	);
}

export default isRectInRect;
