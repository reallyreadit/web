const path = require('path');

const project = require('../../project'),
	  createBuild = require('../../createBuild');

const build = createBuild({
	webpack: {
		configFileName: 'tsconfig.extension.browser-action.json',
		entry: path.posix.join(project.srcDir, 'extension/browser-action/main.ts')
	},
	scss: `${project.srcDir}/extension/browser-action/**/*.{css,scss}`,
	staticAssets: `${project.srcDir}/extension/browser-action/**/*.{html,ttf}`,
	path: 'extension/browser-action'
});

module.exports = build;