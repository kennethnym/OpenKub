import ErrorCodes from './error-codes';

export interface ApiResponse<T> {
	status: number;
	data: T | null;
	error: ErrorResponse | null;
}

export interface ErrorResponse {
	error: ErrorCodes;
	message?: string;
}
