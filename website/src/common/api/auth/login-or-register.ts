import Player from '../../models/player';
import { API_URL } from '../constants';
import ApiResponse from '../api-response';

async function loginOrRegister({
	playerName,
	password,
}: {
	playerName: string;
	password: string;
}): Promise<ApiResponse<Player>> {
	const form = new FormData();

	form.append('username', playerName);
	form.append('password', password);

	const result = await fetch(`${API_URL}/login`, {
		method: 'POST',
		body: form,
	}).then((response) => response.json());

	console.log('result', result);

	return {
		status: result.status,
		error: result.error ? result : null,
		data: result.error ? null : result,
	};
}

export default loginOrRegister;
