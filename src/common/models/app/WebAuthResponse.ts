export default interface WebAuthResponse {
	callbackURL?: string,
	error?: 'Cancelled' | 'PresentationContextInvalid' | 'PresentationContextNotProvided' | 'Unknown' | 'Unsupported'
}