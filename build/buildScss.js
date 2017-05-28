const gulp = require('gulp'),
	  sourcemaps = require('gulp-sourcemaps'),
	  concat = require('gulp-concat'),
	  sass = require('gulp-sass'),
	  clean = require('gulp-clean-css');

const mapSourceRoot = require('./mapSourceRoot'),
	project = require('./project');

function buildScss(params) {
	let stream = gulp
		.src(params.src, { base: params.base })
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(concat('bundle.css'));
	if (params.env === project.env.dev) {
		stream = stream.pipe(sourcemaps.write('.', {
			sourceRoot: file => mapSourceRoot(file, params.dest)
		}));
	} else {
		steam = stream.pipe(clean());
	}
	return stream
		.pipe(gulp.dest(params.dest))
		.on('end', params.onComplete || function () { });
}

module.exports = buildScss;