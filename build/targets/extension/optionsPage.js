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
		fileName: `bundle.css`,
		files: [

			// ------
			// TODO: to shrink package size: instead of including all components, we only included the used ones here.
			// Even more efficient would be separate component SCSS used by other extension code as well (the Alert e.g.),
			// and reuse it from a single file.
			// `${project.srcDir}/common/components/**/*.{css,scss}`,
			`${project.srcDir}/common/components/Icon.scss`,
			`${project.srcDir}/common/components/SaveIndicator.scss`,
			`${project.srcDir}/common/components/SpinnerIcon.scss`,
			`${project.srcDir}/common/components/ToggleSwitch*.scss`,
			// ------
			`${project.srcDir}/common/styles/reset.css`,
			`${project.srcDir}/extension/options-page/**/*.{css,scss}`,
		],
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