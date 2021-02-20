# reallyread.it web
## Setup Guide
### Common
1. Install NodeJS	LTS: https://nodejs.org/en/download/
2. Configure the NodeJS environment for development

        export NODE_ENV=development
        export NODE_TLS_REJECT_UNAUTHORIZED=0
3. Install packages

        npm install
4. Gulp is included as a development dependency and is used to execute build actions. If you do not have Gulp installed globally or have an incompatible global version installed you can create an alias to the version included in this repository.

        alias gulp="node node_modules/gulp/bin/gulp.js"
### App
1. Configure the web server. Optionally set the value for `stripePublishableKey` if you want to enable subscription purchases through Stripe.

        src/app/server/config.ts
    ```typescript
    import HttpEndpoint from '../../common/HttpEndpoint';

    let config: {
    	apiServer: HttpEndpoint,
    	chromeExtensionId: string,
    	contentRootPath: string,
    	cookieDomain: string,
    	cookieName: string,
    	logStream?: {
    		type: string,
    		path: string,
    		period: string,
    		count: number,
    		level: number
    	},
    	packageFilePath: string,
    	port: number | string,
    	secureCookie: boolean,
    	serveStaticContent: boolean,
    	staticServer: HttpEndpoint,
    	stripePublishableKey: string,
    	webServer: HttpEndpoint
	 };

    config = {
    	apiServer: {
    		protocol: 'https',
    		host: 'api.dev.readup.com'
    	},
    	chromeExtensionId: '',
    	contentRootPath: 'bin/dev/app/client',
    	cookieDomain: '.dev.readup.com',
    	cookieName: 'devSessionKey',
    	packageFilePath: 'package.json',
    	port: 5001,
    	secureCookie: true,
    	serveStaticContent: true,
    	staticServer: {
    		protocol: 'https',
    		host: 'static.dev.readup.com'
    	},
    	stripePublishableKey: '',
    	webServer: {
    		protocol: 'https',
    		host: 'dev.readup.com'
    	}
	 };

    export default config;
    ```
2. Start the server

        gulp watch:dev:app
### Embed
1. Configure the embed

        src/embed/config.dev.json
    ```json
    {
    	"apiServer": {
    		"protocol": "https",
    		"host": "api.dev.readup.com"
    	},
    	"staticServer": {
    		"protocol": "https",
    		"host": "static.dev.readup.com"
    	},
    	"webServer": {
    		"protocol": "https",
    		"host": "dev.readup.com"
    	}
    }
    ```
2. Build the embed

        gulp build:dev:embed
### Extension
1. Configure the extension

        src/extension/common/config.dev.json
    ```json
    {
    	"api": {
    		"protocol": "https",
    		"host": "api.dev.readup.com"
    	},
    	"cookieDomain": "dev.readup.com",
    	"cookieName": "devSessionKey",
    	"static": {
    		"protocol": "https",
    		"host": "static.dev.readup.com"
    	},
    	"web": {
    		"protocol": "https",
    		"host": "dev.readup.com"
    	}
    }
    ```
2. Build the extension

        gulp build:dev:extension
3. Load the extension in a browser
    - Chrome
        1. Go to chrome://extensions and enable "Developer mode"
        2. Click "Load unpacked extension..." and select the output directory (`bin/dev/extension`)
    - Firefox
        1. Go to about:debugging
        2. Click "This Firefox"
        2. Click "Load Temporary Add-on" and select the `manifest.json` file from the output directory (`bin/dev/extension`)
### Native Client
1. Configure the native client reader

        src/native-client/reader/config.dev.json
    ```json
    {
    	"webServer": {
    		"protocol": "https",
    		"host": "dev.readup.com"
    	}
    }
    ```
2. Build the native client script bundles

        gulp build:dev:native-client-reader
        gulp build:dev:native-client-share-extension
3. Copy files to the `ios` repository under `IosApp/reader.js` and `ShareExtension/share-extension.js` and update `RRITReaderScriptVersion` and `RRITShareExtensionScriptVersion` in the `plist` files.