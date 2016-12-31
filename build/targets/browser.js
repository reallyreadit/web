const gulp = 		require('gulp'),
	  sourcemaps = 	require('gulp-sourcemaps'),
	  util = 		require('gulp-util'),
	  concat = 		require('gulp-concat'),
	  sass = 		require('gulp-sass'),
	  webpack = 	require('webpack'),
	  path = 		require('path'),
	  del = 		require('del');

const project = require('../project'),
	  delayedWatch = require('../delayedWatch');

const browserSrcPath = path.posix.join(project.srcDir, 'browser'),
	  scssSrcGlob = `${project.srcDir}/{browser,common}/**/*.{css,scss}`,
	  staticAssets = [
		  `${project.srcDir}/{browser,common}/**/*.ttf`,
		  `${project.srcDir}/{browser,common}/**/*.ico`
	  ],
	  devPath = path.posix.join(project.devPath, 'browser');

const tsConfig = {
	configFileName: 'tsconfig.browser.json',
	compilerOptions: {
		sourceMap: true
	}
};
const webpackConfig = {
	entry: `./${browserSrcPath}/main.tsx`,
	devtool: 'source-map',
	output: {
		path: path.join(project.rootAbsPath, devPath),
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

function mapSourceRoot(sourceFile, destDir) {
	return path.join(path.relative(path.join(destDir, path.dirname(sourceFile.relative)), '.'), project.srcDir);
}
function runWebpack(config, onComplete) {
	webpack(config, (error, stats) => {
		if (error) {
			throw new util.PluginError('webpack', error);
		}
		util.log(stats.toString({
			chunks: false,
			colors: true
		}));
		if (onComplete) {
			onComplete();
		}
	});
}
function buildScss(onComplete) {
	return gulp
		.src(scssSrcGlob)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(concat('bundle.css'))
		.pipe(sourcemaps.write('.', {
			sourceRoot: (file) => mapSourceRoot(file, devPath)
		}))
		.pipe(gulp.dest(devPath))
		.on('end', onComplete || function () {});
}
function buildStaticAssets(onComplete) {
	return gulp
		.src(staticAssets)
		.pipe(gulp.dest(devPath))
		.on('end', onComplete || function () {});
}

function clean() {
	return del(`${devPath}/*`);
}
function build() {
	return Promise.all([
		new Promise((resolve, reject) => runWebpack(webpackConfig, resolve)),
		new Promise((resolve, reject) => buildScss(resolve)),
		new Promise((resolve, reject) => buildStaticAssets(resolve))
	]);
}
function watch() {
	runWebpack(Object.assign({}, webpackConfig, { watch: true }));
	buildScss(() => delayedWatch(scssSrcGlob, buildScss));
	buildStaticAssets(() => delayedWatch(staticAssets, buildStaticAssets));
}

module.exports = {
	clean, build, watch
};