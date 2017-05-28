const gulp = require('gulp'),
	  sourcemaps = require('gulp-sourcemaps'),
	  concat = require('gulp-concat'),
	  sass = require('gulp-sass');

const mapSourceRoot = require('./mapSourceRoot');

function buildScss(params) {
	let stream = gulp
		.src(params.src, { base: params.base })
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(concat('bundle.css'));
	if (params.sourceMaps) {
		stream = stream.pipe(sourcemaps.write('.', {
			sourceRoot: file => mapSourceRoot(file, params.dest)
		}));
	}
	return stream
		.pipe(gulp.dest(params.dest))
		.on('end', params.onComplete || function () { });
}

module.exports = buildScss;