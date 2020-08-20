import AuthErrorCodes from './auth/error_codes';

type ErrorCodes = AuthErrorCodes | BasicErrorCodes;

enum BasicErrorCodes {
	UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
}

export default ErrorCodes;
