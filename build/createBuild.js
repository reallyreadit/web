const
	del = require('del'),
	path = require('path');

const
	project = require('./project'),
	delayedWatch = require('./delayedWatch'),
	configureWebpack = require('./configureWebpack'),
	runWebpack = require('./runWebpack'),
	buildStaticAssets = require('./buildStaticAssets'),
	buildScss = require('./buildScss');

function createBuild(params) {
	// set the source path
	const srcPath = path.posix.join(project.srcDir, params.path);
	// set a default build completion delegate if not provided
	params.onBuildComplete = (
		params.onBuildComplete ||
		((buildInfo, resolve) => {
			if (resolve) {
				resolve();
			}
		})
	);
	// batch static assets by base path
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
	// webpack config helper
	function getWebpackConfig(options) {
		return configureWebpack({
			appConfig: params.webpack.appConfig,
			entry: './' + params.webpack.entry,
			env: options.env,
			fileName: params.webpack.fileName || 'bundle.js',
			outputLibrary: params.webpack.outputLibrary,
			minify: (
				params.webpack.minify != null ?
					params.webpack.minify :
					options.env !== project.env.dev
			),
			path: params.path,
			sourceMaps: (
				params.webpack.sourceMaps != null ?
					params.webpack.sourceMaps :
					options.env === project.env.dev
			),
			watch: options.watch
		});
	}
	// return build
	return {
		clean: function (env) {
			return del(project.getOutPath(params.path, env));
		},
		build: function (env) {
			const
				outPath = project.getOutPath(params.path, env),
				tasks = [];
			if (params.webpack) {
				tasks.push(new Promise(resolve => {
					runWebpack(
						getWebpackConfig({ env }),
						() => {
							params.onBuildComplete({ build: 'webpack', env, outPath }, resolve);
						}
					);
				}));
			}
			if (params.scss) {
				tasks.push(new Promise(resolve => {
					buildScss({
						src: params.scss,
						dest: outPath,
						base: srcPath,
						onComplete: () => {
							params.onBuildComplete({ build: 'scss', env, outPath }, resolve);
						},
						env
					});
				}));
			}
			if (staticAssets) {
				staticAssets.forEach(asset => tasks.push(new Promise(resolve => {
					buildStaticAssets({
						src: asset.src,
						dest: outPath,
						base: asset.base,
						onComplete: () => {
							params.onBuildComplete({ build: 'staticAssets', env, outPath }, resolve);
						}
					});
				})));
			}
			return Promise.all(tasks);
		},
		watch: function () {
			// set the output path
			const devOutPath = project.getOutPath(params.path, project.env.dev);
			if (params.webpack) {
				runWebpack(
					getWebpackConfig({
						env: project.env.dev,
						watch: true
					}),
					() => {
						params.onBuildComplete({
							build: 'webpack',
							env: project.env.dev,
							outPath: devOutPath
						});
					}
				);
			}
			if (params.scss) {
				buildScss({
					src: params.scss,
					dest: devOutPath,
					base: srcPath,
					env: project.env.dev,
					onComplete: () => {
						delayedWatch(
							params.scss,
							() => {
								buildScss({
									src: params.scss,
									dest: devOutPath,
									base: srcPath,
									env: project.env.dev,
									onComplete: () => {
										params.onBuildComplete({
											build: 'scss',
											env: project.env.dev,
											outPath: devOutPath
										});
									}
								});
							}
						);
						params.onBuildComplete({
							build: 'scss',
							env: project.env.dev,
							outPath: devOutPath
						});
					}
				});
			}
			if (staticAssets) {
				staticAssets.forEach(asset => {
					buildStaticAssets({
						src: asset.src,
						dest: devOutPath,
						base: asset.base,
						env: project.env.dev,
						onComplete: () => {
							delayedWatch(
								asset.src,
								() => {
									buildStaticAssets({
										src: asset.src,
										dest: devOutPath,
										base: asset.base,
										env: project.env.dev,
										onComplete: () => {
											params.onBuildComplete({
												build: 'staticAssets',
												env: project.env.dev,
												outPath: devOutPath
											});
										}
									});
								}
							);
							params.onBuildComplete({
								build: 'staticAssets',
								env: project.env.dev,
								outPath: devOutPath
							});
						}
					});
				});
			}
		}
	};
}

module.exports = createBuild;