enum AuthenticationError {
	Cancelled = 1,
	InvalidAuthToken = 2,
	InvalidSessionId = 3,
	EmailAddressRequired = 4,
	Unknown = 5
}
export const errorMessage = {
	[AuthenticationError.Cancelled]: 'Authentication Cancelled',
	[AuthenticationError.InvalidAuthToken]: 'Account Must Have Email Address',
	[AuthenticationError.InvalidSessionId]: 'Invalid Auth Token',
	[AuthenticationError.EmailAddressRequired]: 'Invalid Session ID',
	[AuthenticationError.Unknown]: 'An Unknown Error Occurred'
};
export default AuthenticationError;