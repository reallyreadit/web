const path = require('path');

const project = require('../../project'),
	  createBuild = require('../../createBuild');

const build = createBuild({
	webpack: {
		configFileName: 'tsconfig.extension.browser-action.json',
		entry: path.posix.join(project.srcDir, 'extension/browser-action/main.ts'),
		appConfig: path.posix.join(project.srcDir, 'extension/common/config.{env}.json'),
		htmlTemplate: path.posix.join(project.srcDir, 'extension/browser-action/html.ts')
	},
	scss: [
		`${project.srcDir}/extension/browser-action/**/*.scss`,
		`${project.srcDir}/common/**/*.scss`
	],
	staticAssets: `${project.srcDir}/extension/browser-action/**/*.ttf`,
	path: 'extension/browser-action'
});

module.exports = build;