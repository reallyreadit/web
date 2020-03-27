import Page from './reading/Page';
import HttpEndpoint from './HttpEndpoint';

declare global {
	interface AppWindow {
		// iOS keyboard scroll bug
		isFocusedOnField: boolean
	}
	interface AlertContentScriptWindow { }
	interface ReaderContentScriptWindow { }
	interface ReaderWindow { }
	interface Window {
		reallyreadit: {
			alertContentScript?: AlertContentScriptWindow,
			app?: AppWindow,
			readerContentScript?: ReaderContentScriptWindow,
			extension?: {
				config?: {
					api: HttpEndpoint,
					contentParserVersion: string,
					cookieName: string,
					cookieDomain: string,
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