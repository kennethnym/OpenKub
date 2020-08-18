import React from 'react';
import Tippy from '@tippyjs/react';
import classNames from 'classnames';

interface IconButtonProps {
	icon: string;
	tooltip?: string;
}

function IconButton({ icon, tooltip }: IconButtonProps) {
	return (
		<Tippy content={tooltip}>
			<i className={classNames('uil', `uil-${icon}`, 'text-lg')} />
		</Tippy>
	);
}

export default IconButton;
