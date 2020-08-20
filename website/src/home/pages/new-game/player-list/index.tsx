import React, { useState } from 'react';
import Tippy from '@tippyjs/react';

import Player from 'src/common/api/player';
import { IconButton } from 'src/common/components';

import InvitePlayerPopup from './InvitePlayerPopup';

interface PlayerListProps {
	players: Player[];
}

function PlayerList({ players }: PlayerListProps) {
	const [showInvitePlayersPopup, setShowInvitePlayerPopup] = useState(false);

	function toggleInvitePlayersPopup() {
		setShowInvitePlayerPopup(!showInvitePlayersPopup);
	}

	return (
		<>
			<div className="flex flex-row justify-between">
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
		</>
	);
}

export default PlayerList;
