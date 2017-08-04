const gulp = 		 require('gulp'),
	  sourcemaps = 	 require('gulp-sourcemaps'),
	  typeScript =	 require('gulp-typescript'),
	  path = 		 require('path'),
	  changed =		 require('gulp-changed');

const project = require('./project');

function buildTypescript(params) {
	let tsProject = typeScript.createProject(params.compilerOptions),
		task = gulp
			.src(params.src, { base: project.srcDir })
			.pipe(changed(params.dest, { extension: '.js' }));
	if (params.sourceMaps) {
		task = task.pipe(sourcemaps.init());
	}
	task = task.pipe(tsProject());
	if (params.sourceMaps) {
		task = task.pipe(sourcemaps.write('.', {
			includeContent: false,
			sourceRoot: path.relative(params.dest, project.srcDir)
		}));
	}
	return task
		.pipe(gulp.dest(params.dest))
		.on('end', params.onComplete || function() {});
}

module.exports = buildTypescript;