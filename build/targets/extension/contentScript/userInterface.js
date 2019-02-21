const
	fs = require('fs'),
	path = require('path');

const
	project = require('../../../project'),
	createBuild = require('../../../createBuild');

const build = createBuild({
	onBuildComplete: (buildInfo, resolve) => {
		if (buildInfo.build === 'scss') {
			const fileName = path.join(buildInfo.outPath, 'bundle.css');
			fs.writeFileSync(
				fileName,
				fs
					.readFileSync(fileName)
					.toString()
					.replace(
						'{EXTENSION_ID}',
						JSON
							.parse(
								fs
									.readFileSync(
										path.posix.join(
											project.srcDir,
											`extension/content-script/user-interface/config.${buildInfo.env}.json`
										)
									)
									.toString()
							)
							.extensionId
					)
			);
			if (resolve) {
				resolve();
			}
		}
	},
	path: 'extension/content-script/user-interface',
	scss: [
		`${project.srcDir}/common/components/RatingSelector.scss`,
		`${project.srcDir}/common/components/reader/Footer.scss`,
		`${project.srcDir}/extension/content-script/user-interface/**/*.{css,scss}`
	],
	staticAssets: [
		`${project.srcDir}/extension/content-script/user-interface/fonts/**/*.*`
	],
	webpack: {
		entry: path.posix.join(project.srcDir, 'extension/content-script/user-interface/main.ts')
	}
});

module.exports = build;