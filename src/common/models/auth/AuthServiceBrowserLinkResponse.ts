import AuthServiceAccountAssociation from './AuthServiceAccountAssociation';
import AuthenticationError from './AuthenticationError';

interface ResponseBase {
	requestToken: string
}
export interface AuthServiceBrowserLinkSuccessResponse extends ResponseBase {
	association: AuthServiceAccountAssociation
}
export interface AuthServiceBrowserLinkFailureResponse extends ResponseBase {
	error: AuthenticationError
}
export type AuthServiceBrowserLinkResponse = AuthServiceBrowserLinkSuccessResponse | AuthServiceBrowserLinkFailureResponse;
export function isAuthServiceBrowserLinkSuccessResponse(response: AuthServiceBrowserLinkResponse): response is AuthServiceBrowserLinkSuccessResponse {
	return !(response as AuthServiceBrowserLinkFailureResponse).error;
}