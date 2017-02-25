const gulp = 		require('gulp'),
	  sourcemaps = 	require('gulp-sourcemaps'),
	  concat = 		require('gulp-concat'),
	  sass = 		require('gulp-sass');

const mapSourceRoot = require('./mapSourceRoot');

function buildScss(params) {
	return gulp
		.src(params.src, { base: params.base })
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(concat('bundle.css'))
		.pipe(sourcemaps.write('.', {
			sourceRoot: file => mapSourceRoot(file, params.dest)
		}))
		.pipe(gulp.dest(params.dest))
		.on('end', params.onComplete || function () {});
}

module.exports = buildScss;