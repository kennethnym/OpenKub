import React from 'react';
import Tippy from '@tippyjs/react';
import classNames from 'classnames';

interface IconButtonProps {
	icon: string;
	tooltip?: string;
	onClick?: () => void;
	className?: string;
}

function IconButton({ icon, tooltip, onClick, className }: IconButtonProps) {
	return (
		<Tippy content={tooltip}>
			<i
				className={classNames(
					className,
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
