const path = require('path');

const project = require('../project'),
	  createBuild = require('../createBuild');

const build = createBuild({
	webpack: {
		configFileName: 'tsconfig.browser.json',
		entry: path.posix.join(project.srcDir, 'app/browser/main.ts')
	},
	scss: `${project.srcDir}/app/{browser,common}/**/*.{css,scss}`,
	staticAssets: `${project.srcDir}/app/{browser,common}/**/*.{ico,ttf}`,
	path: 'app/browser'
});

module.exports = build;