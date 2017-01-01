const gulp = require('gulp')

function buildStaticAssets(params) {
	return gulp
		.src(params.src, { base: params.base })
		.pipe(gulp.dest(params.dest))
		.on('end', params.onComplete || function () {});
}

module.exports = buildStaticAssets;