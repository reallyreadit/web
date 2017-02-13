const del = require('del');

const project = require('../project'),
	  createBuild = require('../createBuild'),
	  browserAction = require('./extension/browserAction'),
	  contentScript = require('./extension/contentScript'),
	  eventPage = require('./extension/eventPage'),
	  sourceParsers = require('./extension/sourceParsers');

const targetPath = 'extension',
	staticAssets = createBuild({
		staticAssets: [
			`${project.srcDir}/extension/icons/**`,
			`${project.srcDir}/extension/manifest.json`
		],
		path: targetPath
	});

function clean(env) {
	return del(project.getOutPath(targetPath, env) + '/*');
}
function build(env) {
	return Promise.all([
		browserAction.build(env),
		contentScript.build(env),
		eventPage.build(env),
		sourceParsers.build(env),
		staticAssets.build(env)
	]);
}
function watch() {
	browserAction.watch();
	contentScript.watch();
	eventPage.watch();
	sourceParsers.watch();
	staticAssets.watch();
}

module.exports = {
	clean, build, watch
}