# reallyread.it web
## Setup Guide
1. Install NodeJS	14: https://nodejs.org/en/download/
2. Configure the NodeJS environment for development

        export NODE_ENV=development
        export NODE_TLS_REJECT_UNAUTHORIZED=0
3. Install packages

        npm ci
## Running Locally
### App
1. Start the server

        npx gulp watch:dev:app
### Embed
1. Build the embed

        npx gulp build:dev:embed
### Extension
1. Build the extension

        npx gulp build:dev:extension
2. Load the extension in a browser
    - Chrome
        1. Go to chrome://extensions and enable "Developer mode"
        2. Click "Load unpacked extension..." and select the output directory (`bin/dev/extension`)
    - Firefox
        1. Go to about:debugging
        2. Click "This Firefox"
        2. Click "Load Temporary Add-on" and select the `manifest.json` file from the output directory (`bin/dev/extension`)
### Native Client
1. Build the native client script bundles

        npx gulp build:dev:native-client-reader
        npx gulp build:dev:native-client-share-extension
2. Copy files to the `ios` repository under `IosApp/reader.js` and `ShareExtension/share-extension.js` and update `RRITReaderScriptVersion` and `RRITShareExtensionScriptVersion` in the `plist` files.