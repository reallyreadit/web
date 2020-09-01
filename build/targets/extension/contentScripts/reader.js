const
	del = require('del'),
	path = require('path');

const
	project = require('../../../project'),
	createBuild = require('../../../createBuild'),
	contentParserBuild = require('./reader/contentParser');

const
	targetPath = 'extension/content-scripts/reader',
	contentScriptBuild = createBuild({
		scss: [
			`${project.srcDir}/common/**/*.{css,scss}`,
			`${project.srcDir}/extension/content-scripts/reader/**/*.{css,scss}`,
			`${project.srcDir}/extension/content-scripts/ui/shadow-host.css`
		],
		staticAssets: [
			{
				src: `${project.srcDir}/common/styles/reset.css`,
				base: `${project.srcDir}/common/styles`
			}
		],
		webpack: {
			appConfig: {
				path: path.posix.join(project.srcDir, 'extension/common/config.{env}.json'),
				key: 'window.reallyreadit.extension.config'
			},
			entry: path.posix.join(project.srcDir, 'extension/content-scripts/reader/main.ts')
		},
		path: targetPath
	});

function clean(env) {
	return del(project.getOutPath(targetPath, env) + '/*');
}
function build(env) {
	return Promise.all([
		contentScriptBuild.build(env),
		contentParserBuild.build(env)
	]);
}
function watch() {
	return Promise.all([
		contentScriptBuild.watch(),
		contentParserBuild.watch()
	]);
}

module.exports = {
	clean, build, watch
};