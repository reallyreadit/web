const path = require('path');

const project = require('../../project'),
	  createBuild = require('../../createBuild');

const build = createBuild({
	webpack: {
		configFileName: 'tsconfig.extension.browser-action.json',
		entry: path.posix.join(project.srcDir, 'extension/browser-action/main.ts')
	},
	staticAssets: `${project.srcDir}/extension/{browser-action,common}/**/*.html`,
	srcPath: path.posix.join(project.srcDir, 'extension/browser-action'),
	outPath: path.posix.join(project.devPath, 'extension/browser-action')
});

module.exports = build;