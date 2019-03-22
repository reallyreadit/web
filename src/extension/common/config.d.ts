import HttpEndpoint from "../../common/HttpEndpoint";

declare global {
	const config: {
		api: HttpEndpoint,
		cookieName: string,
		cookieDomain: string,
		extensionId: string,
		web: HttpEndpoint,
		version: string
	};
}