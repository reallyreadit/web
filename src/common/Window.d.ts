import Page from './reading/Page';

declare global {
	interface AppWindow { }
	interface ContentScriptWindow { }
	interface Window {
		reallyreadit: {
			app?: AppWindow,
			extension?: {
				contentScript: ContentScriptWindow
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