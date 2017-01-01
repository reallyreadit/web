const del = require('del'),
	  path = require('path');

const project = require('../project'),
	  createBuild = require('../createBuild'),
	  browserAction = require('./extension/browserAction'),
	  contentScripts = require('./extension/contentScripts'),
	  eventPage = require('./extension/eventPage'),
	  sourceParsers = require('./extension/sourceParsers');

const outPath = path.join(project.devPath, 'extension'),
	  staticAssets = createBuild({
		   staticAssets: [
			   `${project.srcDir}/extension/icons/**`,
			   `${project.srcDir}/extension/manifest.json`
		   ],
		   srcPath: path.posix.join(project.srcDir, 'extension'),
		   outPath
	  });

function clean() {
	return del(`${outPath}/*`);
}
function build() {
	return Promise.all([
		browserAction.build(),
		contentScripts.build(),
		eventPage.build(),
		sourceParsers.build(),
		staticAssets.build()
	]);
}
function watch() {
	browserAction.watch();
	contentScripts.watch();
	eventPage.watch();
	sourceParsers.watch();
	staticAssets.watch();
}

module.exports = {
	clean, build, watch
}