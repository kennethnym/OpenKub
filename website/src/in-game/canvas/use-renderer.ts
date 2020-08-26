import { useEffect, useRef, useState } from 'react';

import GameRenderer from './game-renderer';

function useRenderer() {
	const [renderer, setRenderer] = useState<Nullable<GameRenderer>>(null);

	useEffect(() => {
		setRenderer(new GameRenderer());
	}, []);

	return renderer;
}

export default useRenderer;
