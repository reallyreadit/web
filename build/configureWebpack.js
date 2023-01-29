// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

const path = require('path'),
	fs = require('fs'),
	webpack = require('webpack'),
	project = require('./project');

// empty plugins array causes build to fail
function addPlugin(webpackConfig, plugin) {
	if (!webpackConfig.plugins) {
		webpackConfig.plugins = [];
	}
	webpackConfig.plugins.push(plugin);
}
function stringifyProperties(object) {
	for (let key in object) {
		const value = object[key];
		if (typeof value !== 'object') {
			object[key] = JSON.stringify(value);
		} else {
			stringifyProperties(object[key]);
		}
	}
}
function configureWebpack(params) {
	const tsConfig = {
			compilerOptions: {},
		},
		webpackConfig = {
			entry: params.entry,
			output: {
				path: path.join(
					project.rootAbsPath,
					project.getOutPath(params.path, params.env)
				),
				filename: params.fileName,
			},
			resolve: {
				extensions: ['.webpack.js', '.web.js', '.js', '.ts', '.tsx'],
			},
			mode: params.env === project.env.prod ? 'production' : 'development',
			module: {
				rules: [
					{
						test: /\.tsx?$/,
						loader: 'ts-loader',
						options: tsConfig,
					},
				],
			},
			performance: {
				hints: false,
			},
			watch: params.watch,
		};
	let define;
	if (params.sourceMaps) {
		tsConfig.compilerOptions.sourceMap = true;
		webpackConfig.devtool = 'source-map';
		webpackConfig.module.rules.push({
			test: /\.js$/,
			enforce: 'pre',
			loader: 'source-map-loader',
			exclude: /node_modules/,
		});
	} else {
		webpackConfig.devtool = false;
	}
	if (params.appConfig) {
		const config = JSON.parse(
			fs
				.readFileSync(params.appConfig.path.replace('{env}', params.env))
				.toString()
		);
		const packageData = JSON.parse(
			fs.readFileSync('./package.json').toString()
		);
		config.version = packageData['it.reallyread'].version;
		stringifyProperties(config);
		define = Object.assign(define || {}, { [params.appConfig.key]: config });
	}
	if (params.minify) {
		webpackConfig.optimization = { minimize: true };
	}
	if (params.env !== project.env.dev) {
		// https://facebook.github.io/react/docs/optimizing-performance.html#use-the-production-build
		define = Object.assign(define || {}, {
			'process.env.NODE_ENV': JSON.stringify('production'),
		});
	}
	if (define) {
		addPlugin(webpackConfig, new webpack.DefinePlugin(define));
	}
	if (params.outputLibrary) {
		webpackConfig.output.library = params.outputLibrary;
	}
	return webpackConfig;
}

module.exports = configureWebpack;
