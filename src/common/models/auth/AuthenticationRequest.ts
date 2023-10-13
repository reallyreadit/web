export enum AuthenticationMethod {
	CreateAccount = 'createAccount',
	SignIn = 'signIn'
}
export interface AuthenticationRequest {
	method: AuthenticationMethod
}
