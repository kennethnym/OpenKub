import Player from '../player/player';
import { API_URL } from '../constants';
import { ApiResponse } from '../api-response';

async function loginOrRegister({
	playerName,
	password,
	newPlayer,
}: {
	playerName: string;
	password: string;
	newPlayer: boolean;
}): Promise<ApiResponse<Player>> {
	const form = new FormData();

	form.append('username', playerName);
	form.append('password', password);

	const response = await fetch(
		`${API_URL}/${newPlayer ? 'register' : 'login'}`,
		{
			method: 'POST',
			body: form,
		}
	);

	const result = await response.json();

	console.log('result', result);

	return {
		status: response.status,
		error: result.error ? result : null,
		data: result.error ? null : result,
	};
}

export default loginOrRegister;
