import React from 'react';

import { TileColor } from './canvas/game-renderer/types';
import { useRenderer } from './canvas';

function InGame() {
	const renderer = useRenderer();

	function draw() {
		renderer?.renderDeck([
			{ num: 3, color: TileColor.BLUE },
			{ num: -1, color: TileColor.BLACK },
			{ num: 3, color: TileColor.BLUE },
			{ num: 6, color: TileColor.BLACK },
			{ num: 7, color: TileColor.BLACK },
			{ num: 10, color: TileColor.ORANGE },
			{ num: 12, color: TileColor.ORANGE },
			{ num: 1, color: TileColor.RED },
			{ num: 2, color: TileColor.BLACK },
			{ num: 5, color: TileColor.BLUE },
			{ num: 9, color: TileColor.RED },
			{ num: 9, color: TileColor.RED },
			{ num: -1, color: TileColor.RED },
			{ num: 8, color: TileColor.BLACK },
		]);
	}

	return (
		<div className="flex h-screen">
			<div className="flex-1 self-stretch bg-gray-200">
				{/*<canvas {...dimension} ref={ref} className="w-full h-full" />*/}
				<div id="pixi-container" className="w-full h-full" />
			</div>
			<div className="w-1/5 self-stretch shadow-xl">
				<button onClick={draw}>draw</button>
			</div>
		</div>
	);
}

export default InGame;
