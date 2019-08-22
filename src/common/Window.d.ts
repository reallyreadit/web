import Page from './reading/Page';
import HttpEndpoint from './HttpEndpoint';

declare global {
	interface AppWindow { }
	interface ContentScriptWindow { }
	interface ReaderWindow { }
	interface Window {
		reallyreadit: {
			app?: AppWindow,
			extension?: {
				config?: {
					api: HttpEndpoint,
					contentParserVersion: string,
					cookieName: string,
					cookieDomain: string,
					extensionId: string,
					static: HttpEndpoint,
					web: HttpEndpoint,
					version: string
				},
				contentScript: ContentScriptWindow
			},
			nativeClient?: {
				reader: ReaderWindow
			}
		},
		webkit: {
			messageHandlers: {
				reallyreadit: {
					postMessage: (message: any) => void
				}
			}
		}
	}
}