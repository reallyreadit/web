import Page from './reading/Page';

declare global {
	interface AppWindow { }
	interface ContentScriptWindow { }
	interface ReaderWindow { }
	interface Window {
		reallyreadit: {
			app?: AppWindow,
			extension?: {
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