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
## Publishing & Deploying
### App
In all the steps below, `{version}` is a placeholder for the unquoted version number of this release, e.g. `1.2.3`.
1. Increment the `[it.reallyread].version.app` version number in `package.json` for this release according to [Semantic Versioning](https://semver.org/) if it hasn't been incremented already. If you want to trigger an "Update Available" toast in the app, update the `appPublic` version as well. If you do not want to trigger an update toast, for example during a non-critical patch release, do not update the `appPublic` version.
2. Run the `publish-app.ps1` script. The deployable assets will be available in the `pkg/app/{version}` directory after the script finishes.
3. Upload the assets.
    1. Upload the `app-{version}.zip` package to `s3://aws.reallyread.it/web-sites`. This is the private location that the EC2 instances will download the package from during installation.
    2. Upload the `.js` and `.css` bundle files to `s3://static.readup.com/app/bundles`. This is the public hosted location that the webapp will link to.
4. Install the package.

	Perform a zero-downtime deployment by installing the package to a server that is offline, bringing that server online, and then taking the server with the old version of the package offline.
    1. Select the target [EC2 instance](https://us-east-2.console.aws.amazon.com/ec2/v2/home?region=us-east-2#Instances:) that is currently offline and start the instance. It should be named `readup-app-server-x` where `x` is `a` or `b`.
	2. Log in to the server using Remote Desktop over the VPN connection (see [`ops` `README`](https://github.com/reallyreadit/ops)) and execute the update script using PowerShell.

			Execute-S3Object -Key app/update.ps1 -Params @{Version = '{version}'}
	3. Log out of the server.
5. Register the EC2 instance with the [`app-servers` ELB target group](https://us-east-2.console.aws.amazon.com/ec2/v2/home?region=us-east-2#TargetGroup:targetGroupArn=arn:aws:elasticloadbalancing:us-east-2:064442047535:targetgroup/app-servers/16e45c6db2907b89).
6. When the target is healthy, deregister the old EC2 instance.
7. When the old EC2 instance has finished draining, log in to the server and shut it down.

		Execute-S3Object -Key app/shutdown.ps1

	**Important**: Always shut down the EC2 servers using the script referenced above. Failure to do so will result in log files not being shipped and processed by the analytics server.