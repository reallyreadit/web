export default interface PasswordResetRequestForm {
	authServiceToken: string,
	captchaResponse: string,
	email: string
}