const path = require('path');

const project = require('../project'),
	  createBuild = require('../createBuild');

const build = createBuild({
	webpack: {
		entry: path.posix.join(project.srcDir, 'app/client/main.ts')
	},
	scss: [
		`${project.srcDir}/app/{client,common}/**/*.{css,scss}`,
		`${project.srcDir}/common/**/*.{css,scss}`
	],
	staticAssets: [
		`${project.srcDir}/app/client/assets/**/*`,
		`${project.srcDir}/app/client/fonts/**/*`,
		`${project.srcDir}/app/client/images/**/*`
	],
	path: 'app/client'
});

module.exports = build;