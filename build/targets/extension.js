const
	del = require('del'),
	fs = require('fs'),
	path = require('path');

const
	project = require('../project'),
	createBuild = require('../createBuild'),
	readerContentScript = require('./extension/contentScripts/reader'),
	eventPage = require('./extension/eventPage'),
	webAppContentScript = require('./extension/contentScripts/webApp'),
	alertContentScript = require('./extension/contentScripts/alert');

const
	targetPath = 'extension',
	staticAssets = createBuild({
		onBuildComplete: (buildInfo, resolve) => {
			// update manifest
			const
				manifestFileName = path.posix.join(buildInfo.outPath, 'manifest.json'),
				manifest = JSON.parse(
					fs
						.readFileSync(manifestFileName)
						.toString()
				),
				package = JSON.parse(
					fs
						.readFileSync('./package.json')
						.toString()
				),
				config = JSON.parse(
					fs
						.readFileSync(path.posix.join(project.srcDir, `extension/common/config.${buildInfo.env}.json`))
						.toString()
				),
				webUrlPattern = config.web.protocol + '://' + config.web.host + '/*';
			manifest.version = package['it.reallyread'].version.extension.package.toString().padEnd(4, '0');
			manifest.content_scripts[0].matches.push(webUrlPattern);
			manifest.permissions.push(webUrlPattern);
			fs.writeFileSync(
				manifestFileName,
				JSON.stringify(manifest, null, 3)
			);
			// update fonts.css
			const fontCssFileName = path.posix.join(buildInfo.outPath, 'content-scripts/ui/fonts.css');
			fs.writeFileSync(
				fontCssFileName,
				fs
					.readFileSync(fontCssFileName)
					.toString()
					.replace(
						/\{EXTENSION_ID\}/g,
						config.extensionId
					)
			);
			if (resolve) {
				resolve();
			}
		},
		path: targetPath,
		staticAssets: [
			`${project.srcDir}/extension/content-scripts/ui/fonts/**`,
			`${project.srcDir}/extension/content-scripts/ui/images/**`,
			`${project.srcDir}/extension/content-scripts/ui/fonts.css`,
			`${project.srcDir}/extension/icons/**`,
			`${project.srcDir}/extension/manifest.json`
		]
	});

function clean(env) {
	return del(project.getOutPath(targetPath, env) + '/*');
}
function build(env) {
	return Promise.all([
		readerContentScript.build(env),
		eventPage.build(env),
		staticAssets.build(env),
		webAppContentScript.build(env),
		alertContentScript.build(env)
	]);
}
function watch() {
	readerContentScript.watch();
	eventPage.watch();
	staticAssets.watch();
	webAppContentScript.watch();
	alertContentScript.watch();
}

module.exports = {
	clean, build, watch
}