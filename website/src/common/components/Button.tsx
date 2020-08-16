import React, { ButtonHTMLAttributes } from 'react';
import classNames from 'classnames';

import { LoadingSpinner } from '.';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	loading?: boolean;
}

function Button({
	children,
	className,
	loading = false,
	disabled = false,
	...props
}: ButtonProps) {
	return (
		<button
			{...props}
			className={classNames(
				className,
				'flex',
				'justify-center',
				'items-center',
				'rounded',
				'transform',
				'transition-all',
				'duration-200',
				'ease-in-out',
				'font-bold',
				'text-white',
				'shadow-lg',
				'px-6 py-4',
				{
					'active:bg-teal-600': !disabled,
					'active:scale-95': !disabled,
					'active:shadow-md': !disabled,
					'hover:scale-105': !disabled,
					'hover:shadow-xl': !disabled,
					'bg-teal-500': !disabled,
					'bg-gray-300': disabled,
					'shadow-none': disabled,
				}
			)}
		>
			{loading ? <LoadingSpinner /> : children}
		</button>
	);
}

export default Button;
