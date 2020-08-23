import React from 'react';

import { InputBox } from 'src/common/components';

import OnlineFriendsList from './OnlineFriendsList';

import './style.css';

function InvitePlayerPopup() {
	return (
		<div className="bg-gray-100 border-2 rounded shadow-lg p-4 max-h-full popup-content">
			<h5 className="text-lg font-bold mb-2">Invite player</h5>
			<InputBox className="mb-4" placeholder="Search..." />
			<h6 className="font-bold mb-2">Online friends</h6>
			<OnlineFriendsList />
		</div>
	);
}

export default InvitePlayerPopup;
