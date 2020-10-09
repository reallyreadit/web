const
	{ src, dest } = require('gulp'),
	mustache = require('gulp-mustache');

function buildTemplates(params) {
	return src(
			params.src,
			{
				base: params.base
			}
		)
		.pipe(
			mustache(
				params.data(params.env),
				{
					extension: params.extension
				}
			)
		)
		.pipe(
			dest(params.dest)
		)
		.on(
			'end',
			params.onComplete || function () { }
		);
}

module.exports = buildTemplates;