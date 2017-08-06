const del = require('del'),
	path = require('path'),
	fs = require('fs');

const project = require('./project'),
	delayedWatch = require('./delayedWatch'),
	configureWebpack = require('./configureWebpack'),
	runWebpack = require('./runWebpack'),
	buildStaticAssets = require('./buildStaticAssets'),
	buildScss = require('./buildScss');

function createBuild(params) {
	const srcPath = path.posix.join(project.srcDir, params.path),
		devOutPath = project.getOutPath(params.path, project.env.dev);
	let staticAssets;
	if (params.staticAssets) {
		staticAssets = (
			typeof params.staticAssets === 'string' ?
				[params.staticAssets] :
				params.staticAssets
		)
			.reduce((batches, element) => {
				if (typeof element === 'string') {
					const srcBaseBatch = batches.find(batch => batch.base === srcPath);
					if (srcBaseBatch) {
						if (typeof srcBaseBatch.src === 'string') {
							srcBaseBatch.src = [srcBaseBatch.src, element];
						} else {
							srcBaseBatch.src.push(element);
						}
					} else {
						batches.push({
							src: element,
							base: srcPath
						});
					}
				} else {
					batches.push(element);
				}
				return batches;
			}, []);
	}
	function getWebpackConfig(opts) {
		return configureWebpack({
			configFileName: params.webpack.configFileName,
			entry: './' + opts.entry,
			appConfig: params.webpack.appConfig,
			path: params.path,
			fileName: opts.fileName,
			sourceMaps: opts.sourceMaps,
			minify: opts.minify,
			env: opts.env,
			watch: opts.watch
		});
	}
	function getHtmlTemplateDelegate(outPath, resolve) {
		return () => {
			const template = path.join(outPath, 'html.js');
			fs.writeFileSync(path.join(outPath, 'index.html'), eval(fs.readFileSync(template).toString()).default);
			fs.unlinkSync(template);
			if (resolve) {
				resolve();
			}
		};
	}
	return {
		clean(env) {
			return del(project.getOutPath(params.path, env));
		},
		build(env) {
			const outPath = project.getOutPath(params.path, env),
				tasks = [];
			if (params.webpack) {
				tasks.push(new Promise((resolve, reject) => runWebpack(getWebpackConfig({
					entry: params.webpack.entry,
					fileName: 'bundle.js',
					sourceMaps: env === project.env.dev,
					minify: env !== project.env.dev,
					env
				}), resolve)));
				if (params.webpack.htmlTemplate) {
					tasks.push(new Promise((resolve, reject) => runWebpack(getWebpackConfig({
						entry: params.webpack.htmlTemplate,
						fileName: 'html.js',
						sourceMaps: false,
						minify: false,
						env
					}), getHtmlTemplateDelegate(outPath, resolve))));
				}
			}
			if (params.scss) {
				tasks.push(new Promise((resolve, reject) => buildScss({
					src: params.scss,
					dest: outPath,
					base: srcPath,
					onComplete: resolve,
					env
				})));
			}
			if (staticAssets) {
				staticAssets.forEach(asset => tasks.push(new Promise((resolve, reject) => buildStaticAssets({
					src: asset.src,
					dest: outPath,
					base: asset.base,
					onComplete: resolve
				}))));
			}
			return Promise.all(tasks);
		},
		watch() {
			if (params.webpack) {
				runWebpack(getWebpackConfig({
					entry: params.webpack.entry,
					fileName: 'bundle.js',
					sourceMaps: true,
					minify: false,
					env: project.env.dev,
					watch: true
				}));
				if (params.webpack.htmlTemplate) {
					runWebpack(getWebpackConfig({
						entry: params.webpack.htmlTemplate,
						fileName: 'html.js',
						sourceMaps: false,
						minify: false,
						env: project.env.dev,
						watch: true
					}), getHtmlTemplateDelegate(devOutPath));
				}
			}
			if (params.scss) {
				buildScss({
					src: params.scss,
					dest: devOutPath,
					base: srcPath,
					env: project.env.dev,
					onComplete: () => delayedWatch(params.scss, () => buildScss({
						src: params.scss,
						dest: devOutPath,
						base: srcPath,
						env: project.env.dev
					}))
				});
			}
			if (staticAssets) {
				staticAssets.forEach(asset => buildStaticAssets({
					src: asset.src,
					dest: devOutPath,
					base: asset.base,
					env: project.env.dev,
					onComplete: () => delayedWatch(asset.src, () => buildStaticAssets({
						src: asset.src,
						dest: devOutPath,
						base: asset.base,
						env: project.env.dev
					}))
				}));
			}
		}
	};
}

module.exports = createBuild;