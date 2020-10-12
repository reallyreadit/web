import HttpEndpoint from './HttpEndpoint';
import PackageVersionInfo from './PackageVersionInfo';

declare global {
	interface AppWindow {
		// iOS keyboard scroll bug
		isFocusedOnField: boolean
	}
	interface AlertContentScriptWindow { }
	interface EmbedWindow { }
	interface ReaderContentScriptWindow { }
	interface ReaderWindow { }
	interface Window {
		reallyreadit: {
			alertContentScript?: AlertContentScriptWindow,
			app?: AppWindow,
			embed?: EmbedWindow,
			readerContentScript?: ReaderContentScriptWindow,
			extension?: {
				config?: {
					api: HttpEndpoint,
					cookieName: string,
					cookieDomain: string,
					static: HttpEndpoint,
					web: HttpEndpoint,
					version: PackageVersionInfo
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