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
	function getWebpackConfig(entry, fileName, sourceMaps, env, watch) {
		return configureWebpack({
			configFileName: params.webpack.configFileName,
			entry: './' + entry,
			appConfig: params.webpack.appConfig,
			path: params.path,
			fileName,
			sourceMaps,
			env,
			watch
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
			return del(project.getOutPath(params.path, env) + '/*');
		},
		build(env) {
			const outPath = project.getOutPath(params.path, env),
				  tasks = [];
			if (params.webpack) {
				tasks.push(new Promise((resolve, reject) => runWebpack(getWebpackConfig(params.webpack.entry, 'bundle.js', env === project.env.dev, env), resolve)));
				if (params.webpack.htmlTemplate) {
					tasks.push(new Promise((resolve, reject) => runWebpack(getWebpackConfig(params.webpack.htmlTemplate, 'html.js', false, env), getHtmlTemplateDelegate(outPath, resolve))));
				}
			}
			if (params.scss) {
				tasks.push(new Promise((resolve, reject) => buildScss({
					src: params.scss,
					dest: outPath,
					base: srcPath,
					onComplete: resolve,
					sourceMaps: env === project.env.dev
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
				runWebpack(getWebpackConfig(params.webpack.entry, 'bundle.js', true, project.env.dev, true));
				if (params.webpack.htmlTemplate) {
					runWebpack(getWebpackConfig(params.webpack.htmlTemplate, 'html.js', false, project.env.dev, true), getHtmlTemplateDelegate(devOutPath));
				}
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