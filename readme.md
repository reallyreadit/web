# reallyread.it web
## Setup Guide
### Common
1. Install NodeJS	8.9.3
2. Configure the NodeJS environment for development
    NODE_ENV=development
3. Install packages
    npm install
### App
1. Configure the web server
    src/app/server/config.ts
```typescript
export default {
	api: {
		protocol: 'http',
		host: 'api.dev.reallyread.it',
		port: 80
	},
	cacheEnabled: false,
	contentRootPath: 'bin/dev/app/browser',
	cookieDomain: 'dev.reallyread.it',
	cookieName: 'devSessionKey',
	enableAnalytics: false,
	extensionId: 'YOUR-LOCAL-EXTENSION-ID-HERE',
	port: 5001
};
```
2. Start the server
    gulp watch:dev:app
### Extension
1. Configure the extension
    src/extension/common/config.dev.json
```json
{
	"api": {
		"protocol": "http",
		"host": "api.dev.reallyread.it"
	},
	"cookieName": "devSessionKey",
	"web": {
		"protocol": "http",
		"host": "dev.reallyread.it"
	}
}
```
2. Build the extension
    gulp build:dev:extension
If you see a compile error for drawBrowserActionIcon.ts implement the changes from my pull request here: https://github.com/DefinitelyTyped/DefinitelyTyped/pull/22658
2. Go to chrome://extensions and enable "Developer mode"
3. Click "Load unpacked extension..." and select the output directory (/bin/dev/extension)
4. Note extension ID (specific to your local machine) for use in other config files