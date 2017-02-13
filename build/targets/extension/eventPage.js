const path = require('path');

const project = require('../../project'),
	  createBuild = require('../../createBuild');

const build = createBuild({
	webpack: {
		configFileName: 'tsconfig.extension.event-page.json',
		entry: path.posix.join(project.srcDir, 'extension/event-page/main.ts'),
		appConfig: true
	},
	staticAssets: `${project.srcDir}/extension/{event-page,common}/**/*.{html,ttf}`,
	path: 'extension/event-page'
});

module.exports = build;