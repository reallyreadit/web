// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

const del = require('del'),
	path = require('path');

const project = require('./project'),
	watch = require('./watch'),
	configureWebpack = require('./configureWebpack'),
	runWebpack = require('./runWebpack'),
	buildStaticAssets = require('./buildStaticAssets'),
	buildScss = require('./buildScss'),
	buildTemplates = require('./buildTemplates');

// Only call onBuildComplete for static assets once after all batches have finished building and use the staticAssets param as the buildInfo src instead of the batches array.
function createStaticAssetsTask(
	staticAssets,
	originalSrc,
	dest,
	env,
	onBuildComplete
) {
	return Promise.all(
		staticAssets.map(
			(asset) =>
				new Promise((resolve) => {
					buildStaticAssets({
						src: asset.src,
						dest,
						base: asset.base,
						env,
						onComplete: resolve,
					});
				})
		)
	).then(
		() =>
			new Promise((resolve) => {
				onBuildComplete(
					{
						build: 'staticAssets',
						src: originalSrc,
						env,
						outPath: dest,
					},
					resolve
				);
			})
	);
}

function createBuild(params) {
	// set the source path
	const srcPath = path.posix.join(project.srcDir, params.path);
	// set a default build completion delegate if not provided
	params.onBuildComplete =
		params.onBuildComplete ||
		((buildInfo, resolve) => {
			if (resolve) {
				resolve();
			}
		});
	// batch static assets by base path
	let staticAssets;
	if (params.staticAssets) {
		staticAssets = (
			typeof params.staticAssets === 'string'
				? [params.staticAssets]
				: params.staticAssets
		).reduce((batches, element) => {
			if (typeof element === 'string') {
				const srcBaseBatch = batches.find((batch) => batch.base === srcPath);
				if (srcBaseBatch) {
					if (typeof srcBaseBatch.src === 'string') {
						srcBaseBatch.src = [srcBaseBatch.src, element];
					} else {
						srcBaseBatch.src.push(element);
					}
				} else {
					batches.push({
						src: element,
						base: srcPath,
					});
				}
			} else {
				batches.push(element);
			}
			return batches;
		}, []);
	}
	// webpack config helper
	function getWebpackConfig(options) {
		return configureWebpack({
			appConfig: params.webpack.appConfig,
			entry: './' + params.webpack.entry,
			env: options.env,
			fileName: params.webpack.fileName || 'bundle.js',
			outputLibrary: params.webpack.outputLibrary,
			minify:
				params.webpack.minify != null
					? params.webpack.minify
					: options.env !== project.env.dev,
			path: params.path,
			sourceMaps:
				params.webpack.sourceMaps != null
					? params.webpack.sourceMaps
					: options.env === project.env.dev,
			watch: options.watch,
		});
	}
	// return build
	return {
		clean: function (env) {
			return del(project.getOutPath(params.path, env));
		},
		build: function (env) {
			const outPath = project.getOutPath(params.path, env),
				tasks = [];
			if (params.webpack) {
				tasks.push(
					new Promise((resolve) => {
						runWebpack(getWebpackConfig({ env }), () => {
							params.onBuildComplete(
								{ build: 'webpack', env, outPath },
								resolve
							);
						});
					})
				);
			}
			if (params.scss) {
				tasks.push(
					new Promise((resolve) => {
						buildScss({
							appConfig: params.scss.appConfig,
							src: params.scss.files,
							dest: outPath,
							base: srcPath,
							fileName: params.scss.fileName,
							onComplete: () => {
								params.onBuildComplete(
									{
										build: 'scss',
										env,
										outPath,
									},
									resolve
								);
							},
							env,
							sourceMaps: params.scss.sourceMaps,
							targetShadowDom: params.scss.targetShadowDom,
						});
					})
				);
			}
			if (staticAssets) {
				tasks.push(
					createStaticAssetsTask(
						staticAssets,
						params.staticAssets,
						outPath,
						env,
						params.onBuildComplete
					)
				);
			}
			if (params.templates) {
				tasks.push(
					new Promise((resolve) => {
						buildTemplates({
							base: srcPath,
							data: params.templates.data,
							dest: outPath,
							env,
							extension: params.templates.extension,
							onComplete: () => {
								params.onBuildComplete(
									{
										build: 'templates',
										env,
										outPath,
									},
									resolve
								);
							},
							src: params.templates.files,
						});
					})
				);
			}
			return Promise.all(tasks);
		},
		watch: function () {
			const outPath = project.getOutPath(params.path, project.env.dev),
				tasks = [];
			if (params.webpack) {
				tasks.push(
					new Promise((resolve) => {
						runWebpack(
							getWebpackConfig({
								env: project.env.dev,
								watch: true,
							}),
							() => {
								params.onBuildComplete(
									{
										build: 'webpack',
										env: project.env.dev,
										outPath: outPath,
									},
									resolve
								);
							}
						);
					})
				);
			}
			if (params.scss) {
				tasks.push(
					new Promise((resolve) => {
						watch(params.scss.files, function buildScssTask() {
							return buildScss({
								appConfig: params.scss.appConfig,
								src: params.scss.files,
								dest: outPath,
								base: srcPath,
								fileName: params.scss.fileName,
								env: project.env.dev,
								onComplete: () => {
									params.onBuildComplete(
										{
											build: 'scss',
											env: project.env.dev,
											outPath: outPath,
										},
										resolve
									);
								},
								sourceMaps: params.scss.sourceMaps,
								targetShadowDom: params.scss.targetShadowDom,
							});
						});
					})
				);
			}
			if (staticAssets) {
				tasks.push(
					new Promise((resolve) =>
						watch(
							staticAssets.reduce((sources, asset) => {
								if (typeof asset.src === 'string') {
									sources.push(asset.src);
								} else {
									sources.push(...asset.src);
								}
								return sources;
							}, []),
							function buildStaticAssetsTask() {
								return createStaticAssetsTask(
									staticAssets,
									params.staticAssets,
									outPath,
									project.env.dev,
									params.onBuildComplete
								).then(resolve);
							}
						)
					)
				);
			}
			if (params.templates) {
				tasks.push(
					new Promise((resolve) => {
						watch(params.templates.files, function buildTemplatesTask() {
							return buildTemplates({
								base: srcPath,
								data: params.templates.data,
								dest: outPath,
								env: project.env.dev,
								extension: params.templates.extension,
								onComplete: () => {
									params.onBuildComplete(
										{
											build: 'templates',
											env: project.env.dev,
											outPath: outPath,
										},
										resolve
									);
								},
								src: params.templates.files,
							});
						});
					})
				);
			}
			return Promise.all(tasks);
		},
	};
}

module.exports = createBuild;
