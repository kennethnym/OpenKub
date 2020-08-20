import React from 'react';

import { InputBox } from 'src/common/components';

function InvitePlayerPopup() {
	return (
		<div className="bg-gray-100 border-2 rounded shadow-lg p-4">
			<h5 className="text-lg font-bold mb-2">Invite player</h5>
			<InputBox className="mb-4" placeholder="Search..." />
			<h6>Online friends</h6>
		</div>
	);
}

export default InvitePlayerPopup;
