const { src, dest } = require('gulp')

function buildStaticAssets(params) {
	return src(params.src, { base: params.base })
		.pipe(dest(params.dest))
		.on('end', params.onComplete || function () {});
}

module.exports = buildStaticAssets;