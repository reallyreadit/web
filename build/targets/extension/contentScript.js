const
	del = require('del'),
	path = require('path');

const
	project = require('../../project'),
	createBuild = require('../../createBuild'),
	contentParserBuild = require('./contentScript/contentParser'),
	userInterfaceBuild = require('./contentScript/userInterface');

const
	targetPath = 'extension/content-script',
	contentScriptBuild = createBuild({
		webpack: {
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
		userInterfaceBuild.build(env)
	]);
}
function watch() {
	return Promise.all([
		contentScriptBuild.watch(),
		contentParserBuild.watch(),
		userInterfaceBuild.watch()
	]);
}

module.exports = {
	clean, build, watch
};