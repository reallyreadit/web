const
	del = require('del'),
	path = require('path');

const
	project = require('../../../project'),
	createBuild = require('../../../createBuild'),
	contentParserBuild = require('./reader/contentParser'),
	appConfigPath = path.posix.join(project.srcDir, 'extension/common/config.{env}.json');

const
	targetPath = 'extension/content-scripts/reader',
	contentScriptBuild = createBuild({
		// Unlike the native reader, we load css from Readup
		scss: {
			appConfig: {
				path: appConfigPath
			},
			// fileName: `bundle-${package['it.reallyread'].version.app}.css`,
			// how to get access to the version inside the content script?
			fileName: `bundle.css`,
			files: [
				`${project.srcDir}/common/components/**/*.{css,scss}`,
				`${project.srcDir}/common/styles/reset.css`,
				`${project.srcDir}/common/reader-app/**/*.{css,scss}`,
				`${project.srcDir}/extension/content-scripts/reader/**/*.{css,scss}`
			],
		},
		staticAssets: [
			{
				src: `${project.srcDir}/common/styles/reset.css`,
				base: `${project.srcDir}/common/styles`
			},
			// TODO PROXY EXT, do we need this?
			`${project.srcDir}/native-client/reader/fonts/**/*.*`,
			`${project.srcDir}/extension/content-scripts/reader/index.html`,

		],
		webpack: {
			appConfig: {
				path: appConfigPath,
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