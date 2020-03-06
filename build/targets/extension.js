const
	del = require('del'),
	fs = require('fs'),
	path = require('path');

const
	project = require('../project'),
	createBuild = require('../createBuild'),
	browserAction = require('./extension/browserAction'),
	contentScript = require('./extension/contentScript'),
	eventPage = require('./extension/eventPage');

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
				);
			manifest.version = package['it.reallyread'].version.extension.package.toString().padEnd(4, '0');
			manifest.permissions.push(config.web.protocol + '://' + config.web.host + '/*');
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
		browserAction.build(env),
		contentScript.build(env),
		eventPage.build(env),
		staticAssets.build(env)
	]);
}
function watch() {
	browserAction.watch();
	contentScript.watch();
	eventPage.watch();
	staticAssets.watch();
}

module.exports = {
	clean, build, watch
}