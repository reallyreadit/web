const path = require('path');

const project = require('../project'),
	  createBuild = require('../createBuild');

const build = createBuild({
	webpack: {
		configFile: 'tsconfig.browser.json',
		entry: path.posix.join(project.srcDir, 'app/browser/main.ts')
	},
	scss: [
		`${project.srcDir}/app/{browser,common}/**/*.{css,scss}`,
		`${project.srcDir}/common/**/*.{css,scss}`
	],
	staticAssets: `${project.srcDir}/app/browser/images/*.{ico,jpg,png}`,
	path: 'app/browser'
});

module.exports = build;