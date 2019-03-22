const
	del = require('del'),
	fs = require('fs'),
	path = require('path');

const
	project = require('../../../project'),
	createBuild = require('../../../createBuild');

const build = createBuild({
	onBuildComplete: (function () {
		const completedBuilds = new Set();
		return (buildInfo, resolve) => {
			completedBuilds.add(buildInfo.build);
			if (
				completedBuilds.has('scss') &&
				completedBuilds.has('staticAssets') &&
				completedBuilds.has('webpack')
			) {
				// insert the extension id into the css bundle
				const cssBundleFileName = path.join(buildInfo.outPath, 'bundle.css');
				fs.writeFileSync(
					cssBundleFileName,
					fs
						.readFileSync(cssBundleFileName)
						.toString()
						.replace(
							/\{EXTENSION_ID\}/g,
							JSON
								.parse(
									fs
										.readFileSync(
											path.posix.join(
												project.srcDir,
												`extension/common/config.${buildInfo.env}.json`
											)
										)
										.toString()
								)
								.extensionId
						)
				);
				// inline images
				const jsBundleFileName = path.join(buildInfo.outPath, 'bundle.js');
				fs.writeFileSync(
					jsBundleFileName,
					fs
						.readFileSync(jsBundleFileName)
						.toString()
						.replace(
							/src: (['"])\/images\/(.+)\1/gi,
							(match, quote, fileName) => (
								'src: "data:image/svg+xml;base64,' +
								fs
									.readFileSync(path.join(buildInfo.outPath, 'images', fileName))
									.toString('base64') +
								'"'
							)
						)
				);
				// cleanup
				del(`${buildInfo.outPath}/images`)
					.then(resolve || (() => { }));
			}
		};
	}()),
	path: 'extension/content-script/user-interface',
	scss: [
		`${project.srcDir}/common/components/RatingSelector.scss`,
		`${project.srcDir}/common/components/reader/Footer.scss`,
		`${project.srcDir}/extension/content-script/user-interface/**/*.{css,scss}`
	],
	staticAssets: [
		`${project.srcDir}/extension/content-script/user-interface/fonts/**/*.*`,
		`${project.srcDir}/extension/content-script/user-interface/images/**/*.*`
	],
	webpack: {
		entry: path.posix.join(project.srcDir, 'extension/content-script/user-interface/main.ts')
	}
});

module.exports = build;