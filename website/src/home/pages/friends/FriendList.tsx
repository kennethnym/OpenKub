import React from 'react';
import classNames from 'classnames';

import { IconButton } from 'src/common/components';
import Player from 'src/common/api/player';

interface FriendListProps {
	friends: Player[];
}

function FriendList({ friends }: FriendListProps) {
	function renderItems() {
		return friends.map(({ id, username, isOnline }) => (
			<li
				className="flex flex-row justify-between items-center text-lg"
				key={id}
			>
				<div className="flex flex-col font-medium">
					<p>{username}</p>
					<p
						className={classNames(
							'text-sm',
							isOnline ? 'text-green-500 font-bold' : 'text-gray-600'
						)}
					>
						{isOnline ? 'Online' : 'Offline'}
					</p>
				</div>
				<div className="flex flex-col space-y-2">
					<IconButton icon="comments-alt" tooltip={`Message ${username}`} />
				</div>
			</li>
		));
	}

	return <ul className="space-y-4">{renderItems()}</ul>;
}

export default FriendList;
