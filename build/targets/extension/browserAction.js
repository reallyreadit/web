const path = require('path');

const project = require('../../project'),
	  createBuild = require('../../createBuild');

const build = createBuild({
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
		`${project.srcDir}/extension/browser-action/fonts/**/*.*`,
		`${project.srcDir}/extension/browser-action/images/**/*.*`
	],
	path: 'extension/browser-action'
});

module.exports = build;