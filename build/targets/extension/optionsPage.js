const path = require('path');

const project = require('../../project'),
	  createBuild = require('../../createBuild'),
	  appConfigPath = path.posix.join(project.srcDir, 'extension/common/config.{env}.json');

// const package = JSON.parse(
// 	fs
// 		.readFileSync('./package.json')
// 		.toString()
// );

const build = createBuild({
	scss: {
		appConfig: {
			path: appConfigPath
		},
		// fileName: `bundle-${package['it.reallyread'].version.extension}.css`,
		fileName: `bundle.css`,
		files: [
			// TODO: this may be further narrowed down to only the components that are used needed
			`${project.srcDir}/common/components/**/*.{css,scss}`,
			`${project.srcDir}/common/styles/reset.css`,
			`${project.srcDir}/extension/options-page/main.scss`,
			// `${project.srcDir}/common/styles/shadow-host.scss`,
		],
		// targetShadowDom: true
	},
	webpack: {
		entry: path.posix.join(project.srcDir, 'extension/options-page/main.ts'),
		appConfig: {
			path: appConfigPath,
			key: 'window.reallyreadit.extension.config'
		},
		sourceMaps: false
	},
	staticAssets: [
		`${project.srcDir}/extension/options-page/index.html`
	],
	path: 'extension/options-page'
});

module.exports = build;