const
	del = require('del'),
	fs = require('fs'),
	path = require('path');

const
	project = require('../../../project'),
	createBuild = require('../../../createBuild'),
	appConfigPath = path.posix.join(project.srcDir, 'extension/common/config.{env}.json');

const jsBundleFileName = 'bundle.js';

let targetPath;
const setTargetPath = (targetPathParam) => {
	targetPath = targetPathParam;
	createHtmlTemplateBuild()
	createContentScriptBuild()
}

// TODO: shouldn't we use a webpack plugin for inline styling,
// rather than writing it ourselves? ("style" plugin afaik)

// NOTE: The reason that we load styles & svgs inline, is consistency with the way the native reader works.
// I tried non-inline loading first (via linking in <head> in src/extension/content-scripts/reader/index.html).
// That works, but weird visual discrepancies occur, probably due to CSS specificity.

// IIFE js function template that inline-loads styles.
// {CSS_BUNDLE} should be replaced with css rules.
const styleInliningTemplate = `
(function () {
	window.reallyreadit = {
		...window.reallyreadit,
		extension: {
			...(window.reallyreadit ? window.reallyreadit.extension : {}),
			injectInlineStyles: function() {
				const style = window.document.createElement('style');
				style.type = 'text/css';
				style.innerHTML = \`{CSS_BUNDLE}\`;
				window.document.body.append(style);
			}
		}
	}
}());
`;

// IIFE js function template that inline-loads SVG symbols.
// {SVG_SYMBOLS} should be replaced with a string containing SVG elements
// without parent (like exported in src/common/svg/icons.ts)
const svgInliningTemplate = `
(function () {
	window.reallyreadit = {
		...window.reallyreadit,
		extension: {
			...(window.reallyreadit ? window.reallyreadit.extension : {}),
			injectSvgElements: function () {
				const svgs = window.document.createElement('div');
				svgs.innerHTML = \`{SVG_SYMBOLS}\`;
				window.document.body.append(svgs);
			}
		}
	}
}());
`;

// This build builds a "HTML template" (html.js) that contains the SVG icons.
// Note: templates/html.scss is not picked up here, but it is included in the style inline
// build.
let htmlTemplateBuild;
const createHtmlTemplateBuild = () => {
	htmlTemplateBuild = createBuild({
		onBuildComplete: (buildInfo, resolve) => {
			if (buildInfo.build === 'webpack') {
				const template = path.join(buildInfo.outPath, 'html.js');
				// The output of the htmlTemplate bundle is assigned to the global variable 'html'
				// when executed with eval() like below.
				// See the execution example in https://webpack.js.org/configuration/output/#outputlibrary
				eval(fs.readFileSync(template).toString());
				fs.writeFileSync(path.join(buildInfo.outPath, 'svgs.html'), html.svgTemplates.default);
				fs.unlinkSync(template);
				if (resolve) {
					resolve();
				}
			}
		},
		path: targetPath,
		webpack: {
			entry: path.posix.join(project.srcDir, 'extension/content-scripts/reader/templates/html.ts'),
			fileName: 'html.js',
			minify: false,
			// https://webpack.js.org/configuration/output/#outputlibraryname
			outputLibrary: 'html',
			sourceMaps: false
		}
	});
}

let
	contentScriptBuild
const createContentScriptBuild = () => {
	contentScriptBuild = createBuild({
		onBuildComplete: (function () {
			const completedBuilds = new Set();
			return (buildInfo, resolve) => {
				completedBuilds.add(buildInfo.build);
				if (
					completedBuilds.has('scss') &&
					completedBuilds.has('webpack')
				) {
					// build the html template
					htmlTemplateBuild
						.build(buildInfo.env)
						.then(() => {
							// concat the inline CSS injector and SVG injectors
							// into to the built js bundle
							const jsBundleFilePath = path.join(buildInfo.outPath, jsBundleFileName);
							const styleInjectorJs = styleInliningTemplate.replace(
								'{CSS_BUNDLE}',
								fs
									.readFileSync(path.join(buildInfo.outPath, 'bundle.css'))
									.toString()
									.replace(/`/g, '\\`')
								// In contrast to the native reader, we're not base64 encoding fonts here
								// we load them from the extension's static files;
								// extension/content-scripts/ui/fonts
							);
							fs.writeFileSync(
								jsBundleFilePath,
								fs
									.readFileSync(jsBundleFilePath)
									.toString()
									.concat(
										'\n',
										styleInjectorJs,
										'\n',
										svgInliningTemplate.replace(
											'{SVG_SYMBOLS}',
											fs
												.readFileSync(path.join(buildInfo.outPath, 'svgs.html'))
												.toString()
										)
									)
							);
							// cleanup
							del([
								// This is a hack to not delete the bundle.css while developing
								// A watcher could call this onBuildComplete without rebuilding the styles
								// (when they didn't change), leading to missing inputs for the onBuildComplete.
								...(buildInfo.env !== project.env.dev ?
									[`${buildInfo.outPath}/bundle.css*`] : []
								)
							])
								.then(resolve || (() => { }));
						});
				} else {
					resolve();
				}
			};
		}()),
		scss: {
			appConfig: {
				path: appConfigPath
			},
			// fileName: `bundle-${package['it.reallyread'].version.app}.css`,
			// how to get access to the version inside the content script?
			// fileName: `bundle.css`,
			files: [
				`${project.srcDir}/common/components/**/*.{css,scss}`,
				`${project.srcDir}/common/styles/reset.css`,
				`${project.srcDir}/common/reader-app/**/*.{css,scss}`,
				`${project.srcDir}/extension/content-scripts/reader/**/*.{css,scss}`
			],
		},
		webpack: {
			appConfig: {
				path: appConfigPath,
				key: 'window.reallyreadit.extension.config'
			},
			entry: path.posix.join(project.srcDir, 'extension/content-scripts/reader/main.ts')
		},
		path: targetPath
	});
}

function clean(env) {
	return del(project.getOutPath(targetPath, env) + '/*');
}
function build(env) {
	return contentScriptBuild.build(env);
}
function watch() {
	return contentScriptBuild.watch();
}

module.exports = {
	clean, build, watch, setTargetPath
};