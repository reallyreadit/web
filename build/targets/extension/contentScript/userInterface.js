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
						'{extensionId}',
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
		`${project.srcDir}/extension/content-script/user-interface/**/*.{css,scss}`,
		`${project.srcDir}/common/components/**/*.{css,scss}`
	],
	staticAssets: [
		`${project.srcDir}/extension/content-script/user-interface/fonts/**/*.*`
	],
	webpack: {
		configFile: 'tsconfig.extension.content-script.json',
		entry: path.posix.join(project.srcDir, 'extension/content-script/user-interface/main.ts')
	}
});

module.exports = build;