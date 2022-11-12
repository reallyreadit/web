// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

const
	del = require('del'),
	fs = require('fs'),
	path = require('path');

const
	project = require('../../project'),
	createBuild = require('../../createBuild'),
	appConfigPath = path.posix.join(project.srcDir, 'native-client/reader/config.{env}.json');

const package = JSON.parse(
	fs
		.readFileSync('./package.json')
		.toString()
);

const jsBundleFileName = `bundle-${package['it.reallyread'].version.nativeClient.reader}.js`;

// IIFE js function template that inline-loads styles.
// {CSS_BUNDLE} should be replaced with css rules.
const styleInliningTemplate = `
(function () {
	const style = window.document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = \`{CSS_BUNDLE}\`;
	window.document.body.append(style);
}());
`;

// IIFE js function template that inline-loads SVG symbols.
// {SVG_SYMBOLS} should be replaced with a string containing SVG elements
// without parent (like exported in src/common/svg/icons.ts)
const svgInliningTemplate = `
(function () {
	const svgs = window.document.createElement('div');
	svgs.innerHTML = \`{SVG_SYMBOLS}\`;
	window.document.body.append(svgs);
}());
`;

// This build builds a "HTML template" (html.js) that contains the SVG icons.
// Note: templates/html.scss is not picked up here, but it is included in the style inline
// build.
const htmlTemplateBuild = createBuild({
	onBuildComplete: (buildInfo, resolve) => {
		if (buildInfo.build === 'webpack') {
			const template = path.join(buildInfo.outPath, 'html.js');
			// The output of the htmlTemplate bundle is assigned to the global variable 'html'
			// when executed with eval() like below.
			// See the execution example in https://webpack.js.org/configuration/output/#outputlibrary
			eval(fs.readFileSync(template).toString());
			fs.writeFileSync(path.join(buildInfo.outPath, 'index.html'), html.svgTemplates.default);
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
		// https://webpack.js.org/configuration/output/#outputlibraryname
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
						// concat the inline CSS injector and SVG injectors
						// into to the built js bundle
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
	scss: {
		appConfig: {
			path: appConfigPath
		},
		files: [
			`${project.srcDir}/common/components/**/*.{css,scss}`,
			`${project.srcDir}/common/styles/reset.css`,
			`${project.srcDir}/common/reader-app/**/*.{css,scss}`,
			`${project.srcDir}/native-client/reader/**/*.{css,scss}`
		]
	},
	staticAssets: [
		`${project.srcDir}/native-client/reader/fonts/**/*.*`
	],
	webpack: {
		appConfig: {
			path: appConfigPath,
			key: 'window.reallyreadit.nativeClient.reader.config'
		},
		entry: path.posix.join(project.srcDir, 'native-client/reader/main.ts'),
		fileName: jsBundleFileName,
		sourceMaps: false
	}
});

module.exports = build;