const
	del = require('del'),
	path = require('path');

const
	project = require('../../project'),
	createBuild = require('../../createBuild'),
	contentParserBuild = require('./contentScript/contentParser'),
	embedBuild = require('./contentScript/embed');

const
	targetPath = 'extension/content-script',
	contentScriptBuild = createBuild({
		webpack: {
			appConfig: {
				path: path.posix.join(project.srcDir, 'extension/common/config.{env}.json'),
				key: 'window.reallyreadit.extension.config'
			},
			entry: path.posix.join(project.srcDir, 'extension/content-script/main.ts')
		},
		path: targetPath
	});

function clean(env) {
	return del(project.getOutPath(targetPath, env) + '/*');
}
function build(env) {
	return Promise.all([
		contentScriptBuild.build(env),
		contentParserBuild.build(env),
		embedBuild.build(env)
	]);
}
function watch() {
	return Promise.all([
		contentScriptBuild.watch(),
		contentParserBuild.watch(),
		embedBuild.watch()
	]);
}

module.exports = {
	clean, build, watch
};