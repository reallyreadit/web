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
## Article Content Parser Publisher Rules
The article content parser supports publisher-specific rules in order to correct parsing issues caused by a publisher's article web page structure. Different rules can be added to fix different problems such as:
- Primary text content mis-identification.
- Ads or other noise identified as primary text content.
- Missing images.

### Primary text content mis-identification.
The process of diagnosing the root cause of primary text content mis-identification and applying an article content parser rule to fix it can vary widely from publisher to publisher, but there are some general similarities as well. In order to document the general approach we'll use this article, which is unreadable as of version `2.0.1` of `common/contentParser`, as an example: https://www.taosnews.com/news/business/talpa-resident-discusses-reading-app-that-promotes-digital-mindfulness/article_c61a3588-4eae-5d93-b897-1294ccc61b1f.html
#### Initial Analysis
Start by answering the following questions:
1. **What content is being identified as the primary text content by the article content parser?** This can often be achieved by simply opening the article in reader mode and comparing the text content therein with the article's HTML source (easily viewable and searchable using "View page source" in a browser).

	In this example, by searching for the first sentence visible in reader mode in the HTML source, we can see that the publisher's subscription promotional copy is identified as the primary text content of the article even though that copy is not visible when the web page first loads in a browser. This is likely caused by the promotional copy consisting of a larger cluster of text nodes than the article itself which is a common problem for short articles.
2. **Is the actual article primary text content present in the HTML source?** The easiest way to check is to search for snippets of the primary text in the HTML source. Be cautious of searching for any characters that may be HTML encoded. It's best to search for snippets that only contain basic alphanumeric ASCII characters.

	In this example, by searching for the first sentence of the article content in the HTML source, we get several results including the actual article content nodes as well as several metadata nodes. It's important to verify that the node cluster actually contains the full article text and not just a preview.

If the actual primary text content is present in the HTML source then continue to the next step.
#### Add a New Rule
To point the parser in the right direction, add a new rule that specifies a selector for an ancestor of the primary text content elements that is not also an ancestor of the elements that are mis-identified as primary text elements.
1. **Choose a selector.** In our example a `div` element with an `[itemprop="articleBody"]` attribute is the nearest common ancestor of the primary text elements. This seems like a good candidate for the following reasons:
	1. The element is close to the primary text elements as measured by depth.
	2. The element uses schema.org microdata to specify that it contains the article body content.
	3. Querying the document for the selector returns only a single element.
2. **Create the rule.** Add or amend an existing entry in the `publishers` array in the `src\common\contentParsing\configuration\configs.ts` file. Entries should be sorted alphabetically using reverse-DNS notation and subdomains (including www.) should be excluded unless specifically required since any subdomain will match a parent domain. There is no existing entry for `taosnews.com` so we'll add a new one:

		{
			hostname: 'taosnews.com',
			contentSearchRootElementSelector: '[itemprop="articleBody"]'
		}
3. **Test the rule.** Increment the versions for `common/contentParser` (in this case to version `2.0.2`) as well as `nativeClient/reader` and `nativeClient/shareExtension` which both reference the content parser. Build both scripts using `npx gulp build:prod:native-client-reader` and `npx gulp build:prod:native-client-share-extension`. Copy both scripts to their respective locations in either the `ios` or `desktop` repositories for testing.

	Repeat the previous steps as many times as necessary until all new rules are working as intended. Then commit the changes to this repository, follow instructions in other repositories for updating the bundled script files, and follow the instructions in the `static` repository for uploading the scripts to the `static.readup.com` server to make them available for existing Readup client applications.
## Publishing & Deploying
### App
In all the steps below, `{version}` is a placeholder for the unquoted version number of this release, e.g. `1.2.3`.
1. Increment the `[it.reallyread].version.app` version number in `package.json` for this release according to [Semantic Versioning](https://semver.org/) if it hasn't been incremented already. If you want to trigger an "Update Available" toast in the app, update the `appPublic` version as well. The toast prompts for a reload of the app for every client running the old app. If you do not want to trigger an update toast, for example during a non-critical patch release, do not update the `appPublic` version. `appPublic` is the only version the `web` client sees. This will result in the old app version running in clients until they are fully restarted.
2. Commit the incremented `package.json` with a commit message like "app release", where "app" can be replaced with whichever sub-projects in the web monorepo (extension, embed, app, native-client) have been updated.
3. Run the `publish-app.ps1` script. The deployable assets will be available in the `pkg/app/{version}` directory after the script finishes.
4. Upload the assets.
    1. Upload the `app-{version}.zip` package to `s3://aws.reallyread.it/web-sites`. This is the private location that the EC2 instances will download the package from during installation.
    2. Upload the `.js` and `.css` bundle files to `s3://static.readup.com/app/bundles`. This is the public hosted location that the webapp will link to.
5. Install the package.

	Perform a zero-downtime deployment by installing the package to a server that is offline, bringing that server online, and then taking the server with the old version of the package offline.
    1. Select the target [EC2 instance](https://us-east-2.console.aws.amazon.com/ec2/v2/home?region=us-east-2#Instances:) that is currently offline and start the instance. It should be named `readup-app-server-x` where `x` is `a` or `b`.
	2. Log in to the server using Remote Desktop over the VPN connection (see [`ops` `README`](https://github.com/reallyreadit/ops)) and execute the update script using PowerShell.

			Execute-S3Object -Key app/update.ps1 -Params @{Version = '{version}'}
	3. Log out of the server. Don't just close the connection, but use a "Sign out" action.
6. Register the EC2 instance with the [`app-servers` ELB target group](https://us-east-2.console.aws.amazon.com/ec2/v2/home?region=us-east-2#TargetGroup:targetGroupArn=arn:aws:elasticloadbalancing:us-east-2:064442047535:targetgroup/app-servers/16e45c6db2907b89). As soon as the new instance is healthy, the old and new instance will each receive 50% of the traffic.
7. When the target is healthy, deregister the old EC2 instance from the ELB target group. It will start "draining". The new instance will receive 100% of the traffic. This is a good moment to check whether there are any critical bugs in the release.
8. When the old EC2 instance has finished draining, log in to the server and shut it down with the following command.

		Execute-S3Object -Key app/shutdown.ps1

	**Important**: Always shut down the EC2 servers using the script referenced above. Failure to do so will result in log files not being shipped and processed by the analytics server.