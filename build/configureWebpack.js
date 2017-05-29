const path = require('path'),
	  fs = require('fs'),
	  webpack = require('webpack');

const project = require('./project');

// empty plugins array causes build to fail
function addPlugin(webpackConfig, plugin) {
	if (!webpackConfig.plugins) {
		webpackConfig.plugins = [];
	}
	webpackConfig.plugins.push(plugin);
}
function configureWebpack(params) {
	const tsConfig = {
			configFileName: params.configFileName,
			compilerOptions: {}
		},
		webpackConfig = {
			entry: params.entry,
			output: {
				path: path.join(project.rootAbsPath, project.getOutPath(params.path, params.env)),
				filename: params.fileName
			},
			resolve: {
				extensions: ['.webpack.js', '.web.js', '.js', '.ts', '.tsx']
			},
			module: {
				rules: [
					{
						test: /\.tsx?$/,
						loader: 'ts-loader',
						options: tsConfig
					}
				]
			},
			watch: params.watch
		};
	let define;
	if (params.sourceMaps) {
		tsConfig.compilerOptions.sourceMap = true;
		webpackConfig.devtool = 'source-map';
		webpackConfig.module.rules.push({
			test: /\.js$/,
			enforce: 'pre',
			loader: 'source-map-loader'
		});
	}
	if (params.appConfig) {
		const config = JSON.parse(fs.readFileSync(params.appConfig.replace('{env}', params.env)).toString());
		// TODO: FIX THIS!!!
		config.api.protocol = JSON.stringify(config.api.protocol);
		config.api.host = JSON.stringify(config.api.host);
		config.web.protocol = JSON.stringify(config.web.protocol);
		config.web.host = JSON.stringify(config.web.host);
		define = Object.assign(define || {}, { config });
	}
	if (params.minify) {
		addPlugin(webpackConfig, new webpack.optimize.UglifyJsPlugin());
	}
	if (params.env !== project.env.dev) {
		// https://facebook.github.io/react/docs/optimizing-performance.html#use-the-production-build
		define = Object.assign(define || {}, {
			'process.env': {
				NODE_ENV: JSON.stringify('production')
			}
		});
	}
	if (define) {
		addPlugin(webpackConfig, new webpack.DefinePlugin(define));
	}
	return webpackConfig;
}

module.exports = configureWebpack;