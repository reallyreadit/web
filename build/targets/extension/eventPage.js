const path = require('path');

const project = require('../../project'),
	  createBuild = require('../../createBuild');

const build = createBuild({
	webpack: {
		entry: path.posix.join(project.srcDir, 'extension/event-page/main.ts'),
		appConfig: {
			path: path.posix.join(project.srcDir, 'extension/common/config.{env}.json'),
			key: 'window.reallyreadit.extension.config'
		}
	},
	staticAssets: [
		`${project.srcDir}/extension/event-page/index.html`
	],
	path: 'extension/event-page'
});

module.exports = build;