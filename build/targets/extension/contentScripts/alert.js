const path = require('path');

const project = require('../../../project'),
	createBuild = require('../../../createBuild');

const build = createBuild({
	path: 'extension/content-scripts/alert',
	scss: [
		`${project.srcDir}/common/templates/global.css`,
		`${project.srcDir}/extension/content-scripts/alert/main.css`,
		`${project.srcDir}/extension/content-scripts/ui/shadow-host.css`
	],
	webpack: {
		appConfig: {
			path: path.posix.join(project.srcDir, 'extension/common/config.{env}.json'),
			key: 'window.reallyreadit.extension.config'
		},
		entry: path.posix.join(project.srcDir, 'extension/content-scripts/alert/main.ts')
	}
});

module.exports = build;