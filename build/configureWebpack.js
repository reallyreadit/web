const path = require('path'),
	  fs = require('fs'),
	  webpack = require('webpack');

const project = require('./project');

function configureWebpack(params) {
	const tsConfig = {
			configFileName: params.configFileName,
			compilerOptions: {}
		},
		webpackConfig = {
			entry: params.entry,
			output: {
				path: path.join(project.rootAbsPath, project.getOutPath(params.path, params.env)),
				filename: 'bundle.js'
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
			}
		};
	if (params.env === project.env.dev) {
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
		webpackConfig.plugins = [new webpack.DefinePlugin({ config })];
	}
	return webpackConfig;
}

module.exports = configureWebpack;