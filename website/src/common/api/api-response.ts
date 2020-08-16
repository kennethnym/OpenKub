import ErrorCodes from './error-codes';

interface ApiResponse<T> {
	status: number;
	data: T | null;
	error: ErrorResponse | null;
}

interface ErrorResponse {
	error: ErrorCodes;
	message?: string;
}

export default ApiResponse;
