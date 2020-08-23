import React from 'react';

import { IconButton } from 'src/common/components';

interface InvitePopupProps {
	fromPlayerName: string;
	onAccept: () => void;
	onReject: () => void;
}

function InvitePopup({ fromPlayerName, onAccept, onReject }: InvitePopupProps) {
	return (
		<div className="flex items-center">
			<p>{fromPlayerName} invited you to a game! Accept?</p>
			<IconButton
				className="text-2xl"
				icon="check"
				tooltip="Accept"
				onClick={onAccept}
			/>
			<IconButton
				className="text-2xl"
				icon="times"
				tooltip="Reject"
				onClick={onReject}
			/>
		</div>
	);
}

export default InvitePopup;
