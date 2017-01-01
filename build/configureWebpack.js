const path = require('path');

const project = require('./project');

function configureWebpack(params) {
	const tsConfig = {
		configFileName: params.configFileName,
		compilerOptions: {
			sourceMap: true
		}
	};
	return {
		entry: params.entry,
		devtool: 'source-map',
		output: {
			path: path.join(project.rootAbsPath, params.outputPath),
			filename: 'bundle.js'
		},
		resolve: {
			extensions: ['', '.webpack.js', '.web.js', '.js', '.ts', '.tsx']
		},
		module: {
			loaders: [
				{
					loader: `ts-loader?${JSON.stringify(tsConfig)}`,
					test: /\.tsx?$/
				}
			],
			preLoaders: [
				{
					loader: 'source-map-loader',
					test: /\.js$/
				}
			]
		}
	};
}

module.exports = configureWebpack;