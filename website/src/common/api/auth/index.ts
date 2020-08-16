import loginOrRegister from './login-or-register';
import AuthErrorCodes from './error_codes';

class Auth {
	public static ErrorCodes = AuthErrorCodes;
	public static loginOrRegister = loginOrRegister;
}

export default Auth;
