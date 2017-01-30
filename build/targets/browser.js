const path = require('path');

const project = require('../project'),
	  createBuild = require('../createBuild');

const build = createBuild({
	webpack: {
		configFileName: 'tsconfig.browser.json',
		entry: path.posix.join(project.srcDir, 'browser/main.ts')
	},
	scss: `${project.srcDir}/{browser,common}/**/*.{css,scss}`,
	staticAssets: `${project.srcDir}/{browser,common}/**/*.{ico,ttf}`,
	srcPath: path.posix.join(project.srcDir, 'browser'),
	outPath: path.posix.join(project.devPath, 'browser')
});

module.exports = build;