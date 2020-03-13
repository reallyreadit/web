const
	del = require('del'),
	fs = require('fs'),
	path = require('path');

const
	project = require('../project'),
	createBuild = require('../createBuild'),
	contentScript = require('./extension/contentScript'),
	eventPage = require('./extension/eventPage'),
	webAppContentScript = require('./extension/webAppContentScript');

const
	targetPath = 'extension',
	staticAssets = createBuild({
		onBuildComplete: (buildInfo, resolve) => {
			const
				fileName = path.posix.join(buildInfo.outPath, 'manifest.json'),
				manifest = JSON.parse(
					fs
						.readFileSync(fileName)
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
				fileName,
				JSON.stringify(manifest, null, 3)
			);
			if (resolve) {
				resolve();
			}
		},
		path: targetPath,
		staticAssets: [
			`${project.srcDir}/extension/icons/**`,
			`${project.srcDir}/extension/manifest.json`
		]
	});

function clean(env) {
	return del(project.getOutPath(targetPath, env) + '/*');
}
function build(env) {
	return Promise.all([
		contentScript.build(env),
		eventPage.build(env),
		staticAssets.build(env),
		webAppContentScript.build(env)
	]);
}
function watch() {
	contentScript.watch();
	eventPage.watch();
	staticAssets.watch();
	webAppContentScript.watch();
}

module.exports = {
	clean, build, watch
}