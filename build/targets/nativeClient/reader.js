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

const jsBundleFileName = `bundle-${package['it.reallyread'].version.nativeClient.reader}.js`;

const styleInliningTemplate = `
(function () {
	const style = window.document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = \`{CSS_BUNDLE}\`;
	window.document.body.append(style);
}());
`;

const svgInliningTemplate = `
(function () {
	const svgs = window.document.createElement('div');
	svgs.innerHTML = \`{SVG_SYMBOLS}\`;
	window.document.body.append(svgs);
}());
`;

const htmlTemplateBuild = createBuild({
	onBuildComplete: (buildInfo, resolve) => {
		if (buildInfo.build === 'webpack') {
			const template = path.join(buildInfo.outPath, 'html.js');
			// the output of the htmlTemplate bundle is assigned to the variable 'html' when executed
			eval(fs.readFileSync(template).toString());
			fs.writeFileSync(path.join(buildInfo.outPath, 'index.html'), html.default);
			fs.unlinkSync(template);
			if (resolve) {
				resolve();
			}
		}
	},
	path: 'native-client/reader',
	webpack: {
		entry: path.posix.join(project.srcDir, 'native-client/reader/templates/html.ts'),
		fileName: 'html.js',
		minify: false,
		outputLibrary: 'html',
		sourceMaps: false
	}
});

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
				// build the html template
				htmlTemplateBuild
					.build(buildInfo.env)
					.then(() => {
						// merge everything into js bundle
						const jsBundleFilePath = path.join(buildInfo.outPath, jsBundleFileName);
						fs.writeFileSync(
							jsBundleFilePath,
							fs
								.readFileSync(jsBundleFilePath)
								.toString()
								.concat(
									'\n',
									styleInliningTemplate.replace(
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
									),
									'\n',
									svgInliningTemplate.replace(
										'{SVG_SYMBOLS}',
										fs
											.readFileSync(path.join(buildInfo.outPath, 'index.html'))
											.toString()
									)
								)
						);
						// cleanup
						del([
								`${buildInfo.outPath}/fonts`,
								`${buildInfo.outPath}/bundle.css*`,
								`${buildInfo.outPath}/index.html`
							])
							.then(resolve || (() => { }));
					});
			} else {
				resolve();
			}
		};
	}()),
	path: 'native-client/reader',
	scss: [
		`${project.srcDir}/common/**/*.{css,scss}`,
		`${project.srcDir}/native-client/reader/**/*.{css,scss}`
	],
	staticAssets: [
		`${project.srcDir}/native-client/reader/fonts/**/*.*`
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