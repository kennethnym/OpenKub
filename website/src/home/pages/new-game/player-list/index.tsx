import React, { useState } from 'react';
import Tippy from '@tippyjs/react';
import isEmpty from 'lodash.isempty';

import PlayerStore from 'src/common/api/player/store';
import { GameRoomStore } from 'src/common/api/game-room';
import { IconButton } from 'src/common/components';
import { useRootSelector } from 'src/store';
import { useSocket } from 'src/common/api/socket';

import InvitePlayerPopup from './invite-player-popup';

function PlayerList() {
	const [showInvitePlayersPopup, setShowInvitePlayerPopup] = useState(false);
	const { socket } = useSocket();
	const player = useRootSelector(PlayerStore.selectPlayer);
	const gameRoom = useRootSelector(GameRoomStore.selectGameRoom)!;
	const isPlayerHosting = useRootSelector(GameRoomStore.isPlayerHosting);

	function toggleInvitePlayersPopup() {
		setShowInvitePlayerPopup(!showInvitePlayersPopup);
	}

	function kickPlayer(playerID: number) {
		return () => {
			if (playerID !== player.id) {
				socket?.emit('kick_player', gameRoom.id, playerID);
			}
		};
	}

	function renderPlayers() {
		const players = gameRoom.players;

		if (isEmpty(players)) {
			return <p>No players in this game yet.</p>;
		}

		return (
			<ul className="space-y-2 overflow-scroll">
				{Object.keys(players!).map((playerID) => {
					const currentPlayer = players![playerID]!;
					const { id, username } = currentPlayer;
					return (
						<React.Fragment key={id}>
							<li className="flex justify-between">
								<div className="flex flex-1">
									<p className="w-1/6 truncate mr-2">{username}</p>
									{id.toString() in gameRoom.playersReady && (
										<p className="font-bold text-green-500">Ready</p>
									)}
								</div>
								{isPlayerHosting && (
									<IconButton
										icon="times"
										className={id !== player.id ? '' : 'invisible'}
										tooltip={`Remove ${username} from game`}
										onClick={kickPlayer(id)}
									/>
								)}
							</li>
							<hr />
						</React.Fragment>
					);
				})}
			</ul>
		);
	}

	return (
		<>
			<div className="flex flex-row justify-between mb-4">
				<h3 className="text-xl font-bold">Players</h3>
				<Tippy
					interactive
					arrow={false}
					placement="bottom"
					theme="dropdown"
					visible={showInvitePlayersPopup}
					onClickOutside={toggleInvitePlayersPopup}
					content={<InvitePlayerPopup />}
				>
					<div>
						<IconButton
							icon="plus"
							tooltip="Invite player..."
							onClick={toggleInvitePlayersPopup}
						/>
					</div>
				</Tippy>
			</div>
			{renderPlayers()}
		</>
	);
}

export default PlayerList;
