import HttpEndpoint from "../../common/HttpEndpoint";

declare global {
	const config: {
		api: HttpEndpoint,
		cookieName: string,
		cookieDomain: string,
		web: HttpEndpoint,
		version: string
	};
}