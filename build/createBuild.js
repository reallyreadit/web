const del = require('del'),
	  path = require('path');

const project = require('./project'),
	  delayedWatch = require('./delayedWatch'),
	  configureWebpack = require('./configureWebpack'),
	  runWebpack = require('./runWebpack'),
	  buildStaticAssets = require('./buildStaticAssets'),
	  buildScss = require('./buildScss');

function createBuild(params) {
	let webpackConfig, staticAssetsParams;
	if (params.webpack) {
		webpackConfig = configureWebpack({
			configFileName: params.webpack.configFileName,
			entry: './' + params.webpack.entry,
			outputPath: params.outPath
		});
	}
	return {
		clean() {
			return del(`${params.outPath}/*`);
		},
		build() {
			const tasks = [];
			if (params.webpack) {
				tasks.push(new Promise((resolve, reject) => runWebpack(webpackConfig, resolve)));
			}
			if (params.scss) {
				tasks.push(new Promise((resolve, reject) => buildScss(params.scss, params.outPath, resolve)));
			}
			if (params.staticAssets) {
				tasks.push(new Promise((resolve, reject) => buildStaticAssets({
					src: params.staticAssets,
					dest: params.outPath,
					base: params.srcPath,
					onComplete: resolve
				})));
			}
			return Promise.all(tasks);
		},
		watch() {
			if (params.webpack) {
				runWebpack(Object.assign({}, webpackConfig, { watch: true }));
			}
			if (params.scss) {
				buildScss(params.scss, params.outPath, () => delayedWatch(params.scss, () => buildScss(params.scss, params.outPath)));
			}
			if (params.staticAssets) {
				buildStaticAssets({
					src: params.staticAssets,
					dest: params.outPath,
					base: params.srcPath,
					onComplete: () => delayedWatch(params.staticAssets, () => buildStaticAssets(params.staticAssets, params.outPath))
				});
			}
		}
	};
}

module.exports = createBuild;