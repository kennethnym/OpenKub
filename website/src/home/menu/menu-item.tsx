import React, { ReactNode } from 'react';
import classNames from 'classnames';

interface MenuItemProps {
	selected: boolean;
	children: ReactNode;
	icon: string;
	onClick: () => void;
}

function MenuItem({ selected = true, children, icon, onClick }: MenuItemProps) {
	return (
		<li
			className={classNames(
				'flex',
				'transition-all',
				'duration-200',
				'ease-in-out',
				'items-center',
				'text-lg',
				'select-none',
				'cursor-pointer',
				{
					'hover:text-teal-400': !selected,
					'text-gray-600': !selected,
					'text-teal-500': selected,
					'font-bold': selected,
				}
			)}
			onClick={onClick}
		>
			<i className={classNames('uil', `uil-${icon}`, 'mr-4', 'text-2xl')} />
			{children}
		</li>
	);
}

export default MenuItem;
