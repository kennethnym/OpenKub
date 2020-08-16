import React, { useState } from 'react';
import { Slide, toast, ToastContainer } from 'react-toastify';

import { Button, InputBox } from '../common/components/';
import Auth from '../common/api/auth';

function Landing() {
	const [playerName, setPlayerName] = useState('');
	const [password, setPassword] = useState('');
	const [loggingIn, setLoggingIn] = useState(false);
	const [incorrectPassword, setIncorrectPassword] = useState(false);

	async function login() {
		setLoggingIn(true);

		try {
			const response = await Auth.loginOrRegister({ playerName, password });

			setLoggingIn(false);

			console.log('response', response);

			if (response.error) {
				switch (response.error.error) {
					case Auth.ErrorCodes.INCORRECT_PASSWORD:
						setIncorrectPassword(true);
						toast.error('Incorrect password!', {
							position: 'top-center',
							transition: Slide,
						});
						break;
					default:
						toast.error('Unexpected error occurred. Please try again later', {
							position: 'top-center',
						});
						break;
				}
			} else if (response.data) {
				console.log('player', response.data);
			}
		} catch (e) {
			console.log('e', e);
			setLoggingIn(false);
		}
	}

	function changePasswordValue(event: React.ChangeEvent<HTMLInputElement>) {
		setPassword(event.target.value);
		setIncorrectPassword(false);
	}

	return (
		<div className="flex flex-col md:flex-row items-center justify-center h-screen w-screen font-sans bg-gray-100">
			<ToastContainer />
			<div className="flex md:flex-1 flex-col self-stretch justify-center items-center bg-teal-500 shadow-inner shadow-lg">
				<div className="flex flex-col items-start mx-8 my-8">
					<h1 className="text-2xl md:text-4xl lg:text-6xl text-white font-bold tracking-tight">
						OpenKub
					</h1>
					<h3 className="text-xl lg:text-3xl text-white tracking-tight">
						Open-source online Rummikub.
					</h3>
					<h4 className="text-lg lg:text-xl text-white tracking-tight opacity-75">
						Free. Private. No ads.
					</h4>
				</div>
			</div>
			<div className="flex flex-1 flex-col space-y-8 px-8 py-8 md:px-24">
				<InputBox
					className="w-full lg:w-3/4 xl:w-1/3"
					value={playerName}
					id="player-name-textbox"
					label="Player name"
					labelIcon="user-circle"
					placeholder="xXxSuperPlayerXxX"
					onChange={(event) => setPlayerName(event.target.value)}
				/>
				<InputBox
					className="w-full lg:w-3/4 xl:w-1/3"
					value={password}
					id="player-password-textbox"
					label="Password"
					labelIcon="asterisk"
					type="password"
					showError={incorrectPassword}
					onChange={changePasswordValue}
				/>
				<Button
					loading={loggingIn}
					disabled={playerName === '' || password === '' || loggingIn}
					className="w-full lg:w-3/4 xl:w-1/3"
					onClick={login}
				>
					Continue
				</Button>
			</div>
		</div>
	);
}

export default Landing;
