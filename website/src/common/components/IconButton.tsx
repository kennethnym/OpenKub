import React from 'react';
import Tippy from '@tippyjs/react';
import classNames from 'classnames';

interface IconButtonProps {
	icon: string;
	tooltip?: string;
	onClick?: () => void;
}

function IconButton({ icon, tooltip, onClick }: IconButtonProps) {
	return (
		<Tippy content={tooltip}>
			<i
				className={classNames(
					'uil',
					`uil-${icon}`,
					'text-lg',
					'transition',
					'duration-200',
					'ease-in-out',
					'hover:text-teal-500'
				)}
				onClick={onClick}
			/>
		</Tippy>
	);
}

export default IconButton;
