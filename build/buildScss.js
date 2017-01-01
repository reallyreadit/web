const gulp = 		require('gulp'),
	  sourcemaps = 	require('gulp-sourcemaps'),
	  concat = 		require('gulp-concat'),
	  sass = 		require('gulp-sass');

const mapSourceRoot = require('./mapSourceRoot');

function buildScss(src, dest, onComplete) {
	return gulp
		.src(src)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(concat('bundle.css'))
		.pipe(sourcemaps.write('.', {
			sourceRoot: file => mapSourceRoot(file, dest)
		}))
		.pipe(gulp.dest(dest))
		.on('end', onComplete || function () {});
}

module.exports = buildScss;