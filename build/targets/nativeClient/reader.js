const
	del = require('del'),
	fs = require('fs'),
	path = require('path');

const
	project = require('../../project'),
	createBuild = require('../../createBuild');

const package = JSON.parse(
	fs
		.readFileSync('./package.json')
		.toString()
);

const jsBundleFileName = `bundle-${package['it.reallyread'].version['native-client'].reader}.js`;

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
				// merge everything into js bundle
				const jsBundleFilePath = path.join(buildInfo.outPath, jsBundleFileName);
				fs.writeFileSync(
					jsBundleFilePath,
					fs
						.readFileSync(jsBundleFilePath)
						.toString()
						.concat(
							'\n',
							fs
								.readFileSync(path.join(buildInfo.outPath, 'templates/style.js'))
								.toString()
								.replace(
									'{CSS_BUNDLE}',
									fs
										.readFileSync(path.join(buildInfo.outPath, 'bundle.css'))
										.toString()
										.replace(/`/g, '\\`')
										.replace(
											/url\((['"]?)\/fonts\/([^)]+)\1\)/gi,
											(match, quote, fileName) => (
												'url(\'data:font/ttf;charset=utf-8;base64,' +
												fs
													.readFileSync(path.join(buildInfo.outPath, 'fonts', fileName))
													.toString('base64') +
												'\')'
											)
										)
								)
						)
				);
				// cleanup
				del([
						`${buildInfo.outPath}/fonts`,
						`${buildInfo.outPath}/templates`,
						`${buildInfo.outPath}/bundle.css*`
					])
					.then(resolve || (() => {}));
			}
		};
	}()),
	path: 'native-client/reader',
	scss: [
		`${project.srcDir}/common/components/ActionLink.scss`,
		`${project.srcDir}/common/components/RatingSelector.scss`,
		`${project.srcDir}/common/components/ShareControl.scss`,
		`${project.srcDir}/common/templates/global.css`,
		`${project.srcDir}/native-client/reader/**/*.{css,scss}`
	],
	staticAssets: [
		`${project.srcDir}/native-client/reader/fonts/**/*.*`,
		`${project.srcDir}/native-client/reader/templates/style.js`
	],
	webpack: {
		appConfig: {
			path: path.posix.join(project.srcDir, 'native-client/reader/config.{env}.json'),
			key: 'window.reallyreadit.nativeClient.reader.config'
		},
		entry: path.posix.join(project.srcDir, 'native-client/reader/main.ts'),
		fileName: jsBundleFileName,
		sourceMaps: false
	}
});

module.exports = build;