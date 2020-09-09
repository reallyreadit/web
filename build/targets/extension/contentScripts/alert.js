const path = require('path');

const project = require('../../../project'),
	createBuild = require('../../../createBuild'),
	themeShadowDomCss = require('../../../themeShadowDomCss');

const build = createBuild({
	onBuildComplete: (buildInfo, resolve) => {
		if (buildInfo.build === 'scss') {
			themeShadowDomCss(path.join(buildInfo.outPath, 'bundle.css'));
		}
		if (resolve) {
			resolve();
		}
	},
	path: 'extension/content-scripts/alert',
	scss: [
		`${project.srcDir}/common/styles/reset.css`,
		`${project.srcDir}/extension/content-scripts/alert/main.scss`,
		`${project.srcDir}/extension/content-scripts/ui/shadow-host.scss`
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