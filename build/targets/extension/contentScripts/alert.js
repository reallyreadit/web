const path = require('path');

const project = require('../../../project'),
	createBuild = require('../../../createBuild');

const build = createBuild({
	path: 'extension/content-scripts/alert',
	scss: {
		files: [
			`${project.srcDir}/common/styles/reset.css`,
			`${project.srcDir}/common/styles/shadow-host.scss`,
			`${project.srcDir}/extension/content-scripts/alert/main.scss`
		],
		targetShadowDom: true
	},
	webpack: {
		appConfig: {
			path: path.posix.join(project.srcDir, 'extension/common/config.{env}.json'),
			key: 'window.reallyreadit.extension.config'
		},
		entry: path.posix.join(project.srcDir, 'extension/content-scripts/alert/main.ts')
	}
});

module.exports = build;