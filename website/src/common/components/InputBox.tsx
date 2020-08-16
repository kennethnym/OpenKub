import React, { InputHTMLAttributes } from 'react';
import classNames from 'classnames';

interface InputBoxProps extends InputHTMLAttributes<HTMLInputElement> {
	showError?: boolean;
	label?: string;
	labelIcon?: string;
}

function InputBox({
	showError,
	label,
	labelIcon,
	className,
	...props
}: InputBoxProps) {
	return (
		<div className="flex flex-col items-start">
			{label && (
				<label
					className={classNames(
						'font-bold',
						'mb-2',
						showError ? 'text-red-400' : 'text-gray-500'
					)}
					htmlFor={props.id}
				>
					{labelIcon && <i className={`uil uil-${labelIcon} text-xl mr-2`} />}
					{label}
				</label>
			)}
			<input
				{...props}
				className={classNames(
					className,
					'transition-all',
					'duration-200',
					'ease-in-out',
					'rounded',
					showError ? 'bg-red-500' : 'bg-gray-200',
					showError && 'text-white',
					'appearance-none',
					'hover:text-current',
					'hover:bg-gray-400',
					'focus:bg-teal-500',
					'focus:outline-none',
					'focus:text-white',
					'focus:placeholder-white',
					'focus:shadow-lg',
					'px-4',
					'py-4'
				)}
			/>
		</div>
	);
}

export default InputBox;
