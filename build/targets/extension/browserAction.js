const
	fs = require('fs'),
	path = require('path');

const
	project = require('../../project'),
	createBuild = require('../../createBuild');

const mainBuild = createBuild({
	webpack: {
		configFile: 'tsconfig.extension.browser-action.json',
		entry: path.posix.join(project.srcDir, 'extension/browser-action/main.ts'),
		appConfig: path.posix.join(project.srcDir, 'extension/common/config.{env}.json'),
		htmlTemplate: path.posix.join(project.srcDir, 'extension/browser-action/templates/html.ts')
	},
	scss: [
		`${project.srcDir}/extension/browser-action/**/*.{css,scss}`,
		`${project.srcDir}/common/**/*.{css,scss}`
	],
	staticAssets: [
		`${project.srcDir}/extension/browser-action/fonts/**/*.*`
	],
	path: 'extension/browser-action'
});

const htmlTemplateBuild = createBuild({
	onBuildComplete: (buildInfo, resolve) => {
		if (buildInfo.build === 'webpack') {
			const template = path.join(buildInfo.outPath, 'html.js');
			// the output of the htmlTemplate bundle is assigned to the variable 'html' when executed
			eval(fs.readFileSync(template).toString());
			fs.writeFileSync(path.join(buildInfo.outPath, 'index.html'), html.default);
			fs.unlinkSync(template);
			if (resolve) {
				resolve();
			}
		}
	},
	path: 'extension/browser-action',
	webpack: {
		configFile: 'tsconfig.extension.browser-action.json',
		entry: path.posix.join(project.srcDir, 'extension/browser-action/templates/html.ts'),
		fileName: 'html.js',
		minify: false,
		outputLibrary: 'html',
		sourceMaps: false
	}
});

function clean(env) {
	return mainBuild.clean(env);
}
function build(env) {
	return Promise.all([
		mainBuild.build(env),
		htmlTemplateBuild.build(env)
	]);
}
function watch() {
	return Promise.all([
		mainBuild.watch(),
		htmlTemplate.watch()
	]);
}

module.exports = {
	clean, build, watch
};