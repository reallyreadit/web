import Page from './reading/Page';
import HttpEndpoint from './HttpEndpoint';

declare global {
	interface AppWindow { }
	interface AlertContentScriptWindow { }
	interface ContentScriptWindow { }
	interface ReaderWindow { }
	interface Window {
		reallyreadit: {
			alertContentScript?: AlertContentScriptWindow,
			app?: AppWindow,
			readerContentScript?: ContentScriptWindow,
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
				}
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