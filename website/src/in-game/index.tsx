import React from 'react';

import { TileColor } from './game-creator/game-logic';
import { useGameCreator } from './game-creator';

function InGame() {
	const { renderer, gameStateManager, eventCommunicator } = useGameCreator();

	function draw() {
		renderer?.renderDeck([
			{
				num: 3,
				color: TileColor.BLUE,
				id: 1,
				tileGroup: null,
				position: null,
				renderObject: null,
			},
			{
				tileGroup: null,
				position: null,
				renderObject: null,
				num: -1,
				color: TileColor.BLACK,
				id: 2,
			},
			{
				tileGroup: null,
				position: null,
				renderObject: null,
				num: 3,
				color: TileColor.BLUE,
				id: 3,
			},
			{
				tileGroup: null,
				position: null,
				renderObject: null,
				num: 6,
				color: TileColor.BLACK,
				id: 4,
			},
			{
				tileGroup: null,
				position: null,
				renderObject: null,
				num: 7,
				color: TileColor.BLACK,
				id: 5,
			},
			{
				tileGroup: null,
				position: null,
				renderObject: null,
				num: 10,
				color: TileColor.ORANGE,
				id: 6,
			},
			{
				tileGroup: null,
				position: null,
				renderObject: null,
				num: 12,
				color: TileColor.ORANGE,
				id: 7,
			},
			{
				tileGroup: null,
				position: null,
				renderObject: null,
				num: 1,
				color: TileColor.RED,
				id: 8,
			},
			{
				tileGroup: null,
				position: null,
				renderObject: null,
				num: 2,
				color: TileColor.BLACK,
				id: 9,
			},
			{
				tileGroup: null,
				position: null,
				renderObject: null,
				num: 5,
				color: TileColor.BLUE,
				id: 10,
			},
			{
				tileGroup: null,
				position: null,
				renderObject: null,
				num: 9,
				color: TileColor.RED,
				id: 11,
			},
			{
				tileGroup: null,
				position: null,
				renderObject: null,
				num: 9,
				color: TileColor.RED,
				id: 12,
			},
			{
				tileGroup: null,
				position: null,
				renderObject: null,
				num: -1,
				color: TileColor.RED,
				id: 13,
			},
			{
				tileGroup: null,
				position: null,
				renderObject: null,
				num: 8,
				color: TileColor.BLACK,
				id: 14,
			},
		]);
	}

	function validateTiles() {
		renderer?.clearInvalidGroupHighlights();
		gameStateManager.validateTiles();
		renderer?.highlightInvalidGroups();
		console.log('invalid tiles', gameStateManager.invalidGroups);
	}

	return (
		<div className="flex h-screen">
			<div className="flex-1 self-stretch bg-gray-200">
				<div id="pixi-container" className="w-full h-full" />
			</div>
			<div className="w-1/5 flex flex-col space-y-2 self-stretch shadow-xl">
				<button onClick={draw}>draw</button>
				<button onClick={validateTiles}>validate</button>
			</div>
		</div>
	);
}

export default InGame;
