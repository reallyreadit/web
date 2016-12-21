const gulp = 			require('gulp'),
	  sourcemaps = 		require('gulp-sourcemaps'),
	  util = 			require('gulp-util'),
	  concat = 			require('gulp-concat'),
	  sass = 			require('gulp-sass'),
	  typeScript =		require('gulp-typescript'),
	  tsConfig = 		require('./tsconfig.json'),
	  webpack = 		require('webpack'),
	  path = 			require('path'),
	  del = 			require('del'),
	  childProcess = 	require('child_process'),
	  changed =			require('gulp-changed');

const srcDir = 'src',
	  binDir = 'bin',
	  serverSrcGlobs = [`${srcDir}/**/*.{ts,tsx}`, `!${srcDir}/browser/**`],
	  browserScssSrcGlob = `${srcDir}/**/*.{css,scss}`,
	  browserStaticAssets = [
		  `${srcDir}/**/*.ttf`,
		  `${srcDir}/**/*.ico`
	  ],
	  devPath = path.posix.join(binDir, 'dev'),
	  devBrowserPath = path.posix.join(devPath, 'browser'),
	  devServerPath = path.posix.join(devPath, 'server'),
	  watchEventColors = {
		  added:	'green',
		  changed:	'yellow',
		  deleted:	'red',
		  renamed:	'yellow'
	  };

let devServerProcess;

function mapSourceRoot(sourceFile, destDir) {
	return path.join(path.relative(path.join(destDir, path.dirname(sourceFile.relative)), '.'), srcDir);
}
function delayedWatch(globs, delegate) {
	let timeout;
	return gulp.watch(globs, event => {
		util.log(`${util.colors[watchEventColors[event.type]](`[${event.type}]`)} ${util.colors.cyan(event.path)}`);
		if (event.type !== 'added') {
			clearTimeout(timeout);
			timeout = setTimeout(delegate, 500);
		}
	});
}

/**
 * dev
 */
gulp.task('clean:dev', ['clean:dev:server', 'clean:dev:browser']);
gulp.task('build:dev', ['build:dev:server', 'build:dev:browser']);
gulp.task('run:dev', ['run:dev:server', 'build:dev:browser']);
gulp.task('watch:dev', ['watch:dev:server', 'watch:dev:browser']);

/**
 * dev/server
 */
const devServerTsProject = typeScript.createProject(tsConfig.compilerOptions);
function buildDevServer() {
	return gulp
		.src(serverSrcGlobs)
		.pipe(changed(devServerPath, { extension: '.js' }))
		.pipe(sourcemaps.init())
		.pipe(devServerTsProject())
		.pipe(sourcemaps.write('.', {
			includeContent: false,
			sourceRoot: path.relative(devServerPath, srcDir)
		}))
		.pipe(gulp.dest(devServerPath));
}
function startDevServer() {
	devServerProcess = childProcess
		.spawn('node', [
			'--debug',
			'--no-lazy',
			path.join(devServerPath, 'server/main.js')
		], {
			stdio: 'inherit',
			env: {
				NODE_ENV: 'development'
			}
		});
}
gulp.task('clean:dev:server', () => del(`${devServerPath}/*`));
gulp.task('build:dev:server', buildDevServer);
gulp.task('run:dev:server', ['build:dev:server'], startDevServer);
gulp.task('watch:dev:server', ['run:dev:server'], () => delayedWatch(
	serverSrcGlobs, 
	() => devServerProcess
		.on('exit', () => buildDevServer().on('end', startDevServer))
		.kill()
));

/**
 * dev/browser
 */
const webpackConfig = {
	entry: `./${srcDir}/browser/main.tsx`,
	devtool: 'source-map',
	output: {
		path: path.join(__dirname, devBrowserPath),
		filename: 'bundle.js'
	},
	resolve: {
		extensions: ['', '.webpack.js', '.web.js', '.js', '.ts', '.tsx']
	},
	module: {
		loaders: [
			{
				loader: 'ts-loader',
				include: path.join(__dirname, srcDir),
				test: /\.tsx?$/
			}
		],
		preLoaders: [
			{
				loader: 'source-map-loader',
				test: /\.js$/
			}
		]
	},
	ts: {
		compilerOptions: {
			sourceMap: true
		}
	}
};
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
function buildDevBrowserScss(onComplete) {
	return gulp
		.src(browserScssSrcGlob)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(concat('bundle.css'))
		.pipe(sourcemaps.write('.', {
			sourceRoot: (file) => mapSourceRoot(file, devBrowserPath)
		}))
		.pipe(gulp.dest(devBrowserPath))
		.on('end', onComplete || function () {});
}
function buildDevBrowserStaticAssets(onComplete) {
	return gulp
		.src(browserStaticAssets)
		.pipe(gulp.dest(devBrowserPath))
		.on('end', onComplete || function () {});
}
gulp.task('clean:dev:browser', () => del(`${devBrowserPath}/*`));
gulp.task('build:dev:browser', () => Promise.all([
	new Promise((resolve, reject) => runWebpack(webpackConfig, resolve)),
	new Promise((resolve, reject) => buildDevBrowserScss(resolve)),
	new Promise((resolve, reject) => buildDevBrowserStaticAssets(resolve))
]));
gulp.task('watch:dev:browser', () => {
	runWebpack(Object.assign({}, webpackConfig, { watch: true }));
	buildDevBrowserScss(() => delayedWatch(browserScssSrcGlob, buildDevBrowserScss));
	buildDevBrowserStaticAssets(() => delayedWatch(browserStaticAssets, buildDevBrowserStaticAssets));
});