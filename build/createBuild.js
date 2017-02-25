const del = require('del'),
	  path = require('path');

const project = require('./project'),
	  delayedWatch = require('./delayedWatch'),
	  configureWebpack = require('./configureWebpack'),
	  runWebpack = require('./runWebpack'),
	  buildStaticAssets = require('./buildStaticAssets'),
	  buildScss = require('./buildScss');

function createBuild(params) {
	const srcPath = path.posix.join(project.srcDir, params.path),
		  devOutPath = project.getOutPath(params.path, project.env.dev);
	function getWebpackConfig(env) {
		return configureWebpack({
			configFileName: params.webpack.configFileName,
			entry: './' + params.webpack.entry,
			appConfig: params.webpack.appConfig,
			path: params.path,
			env
		});
	}
	return {
		clean(env) {
			return del(project.getOutPath(params.path, env) + '/*');
		},
		build(env) {
			const outPath = project.getOutPath(params.path, env),
				  tasks = [];
			if (params.webpack) {
				tasks.push(new Promise((resolve, reject) => runWebpack(getWebpackConfig(env), resolve)));
			}
			if (params.scss) {
				tasks.push(new Promise((resolve, reject) => buildScss({
					src: params.scss,
					dest: outPath,
					base: srcPath,
					onComplete: resolve
				})));
			}
			if (params.staticAssets) {
				tasks.push(new Promise((resolve, reject) => buildStaticAssets({
					src: params.staticAssets,
					dest: outPath,
					base: srcPath,
					onComplete: resolve
				})));
			}
			return Promise.all(tasks);
		},
		watch() {
			if (params.webpack) {
				runWebpack(Object.assign({}, getWebpackConfig(project.env.dev), { watch: true }));
			}
			if (params.scss) {
				buildScss({
					src: params.scss,
					dest: devOutPath,
					base: srcPath,
					onComplete: () => delayedWatch(params.scss, () => buildScss({
						src: params.scss,
						dest: devOutPath,
						base: srcPath
					}))
				});
			}
			if (params.staticAssets) {
				buildStaticAssets({
					src: params.staticAssets,
					dest: devOutPath,
					base: srcPath,
					onComplete: () => delayedWatch(params.staticAssets, () => buildStaticAssets({
						src: params.staticAssets,
						dest: devOutPath,
						base: srcPath
					}))
				});
			}
		}
	};
}

module.exports = createBuild;