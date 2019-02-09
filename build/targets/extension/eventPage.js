const path = require('path');

const project = require('../../project'),
	  createBuild = require('../../createBuild');

const build = createBuild({
	webpack: {
		entry: path.posix.join(project.srcDir, 'extension/event-page/main.ts'),
		appConfig: path.posix.join(project.srcDir, 'extension/common/config.{env}.json')
	},
	staticAssets: `${project.srcDir}/extension/{event-page,common}/**/*.{html,ttf}`,
	path: 'extension/event-page'
});

module.exports = build;