const
	fs = require('fs'),
	path = require('path');

const
	project = require('../../../project'),
	createBuild = require('../../../createBuild');

const mainBuild = createBuild({
	path: 'extension/content-script/embed',
	scss: [
		`${project.srcDir}/common/components/ActionLink.scss`,
		`${project.srcDir}/common/components/ClipboardTextInput.scss`,
		`${project.srcDir}/common/components/Icon.scss`,
		`${project.srcDir}/common/components/RatingSelector.scss`,
		`${project.srcDir}/common/components/ShareControl.scss`,
		`${project.srcDir}/common/components/Toaster.scss`,
		`${project.srcDir}/common/templates/global.css`,
		`${project.srcDir}/extension/content-script/embed/**/*.{css,scss}`
	],
	staticAssets: [
		`${project.srcDir}/extension/content-script/embed/fonts/**/*.*`,
		`${project.srcDir}/extension/content-script/embed/images/**/*.*`
	],
	webpack: {
		appConfig: {
			path: path.posix.join(project.srcDir, 'extension/common/config.{env}.json'),
			key: 'window.reallyreadit.extension.config'
		},
		entry: path.posix.join(project.srcDir, 'extension/content-script/embed/main.ts')
	}
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
	path: 'extension/content-script/embed',
	webpack: {
		entry: path.posix.join(project.srcDir, 'extension/content-script/embed/templates/html.ts'),
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
		htmlTemplateBuild.watch()
	]);
}

module.exports = {
	clean, build, watch
};