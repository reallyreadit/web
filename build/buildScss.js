const
	{ src, dest } = require('gulp'),
	sourcemaps = require('gulp-sourcemaps'),
	concat = require('gulp-concat'),
	sass = require('gulp-sass'),
	clean = require('gulp-clean-css'),
	insert = require('gulp-insert'),
	fs = require('fs');

sass.compiler = require('sass');

const
	mapSourceRoot = require('./mapSourceRoot'),
	project = require('./project');

function createScssObjectKey(jsObjectKey) {
	return (
		'"' +
		jsObjectKey.replace(
			/([a-z])([A-Z])/g,
			(_, $1, $2) => $1 + '-' + $2.toLowerCase()
		) +
		'"'
	);
}

function createScssObject(object) {
	return (
		'(' +
		Object
			.keys(object)
			.map(
				key => {
					const value = object[key];
					return (
						createScssObjectKey(key) +
						':' +
						(
							typeof value === 'object' ?
								createScssObject(value) :
								JSON.stringify(value)
						)
					);
				}
			)
			.join(',') +
		')'
	);
}

function buildScss(params) {
	// set up the stream
	let stream = src(
		params.src,
		{
			base: params.base
		}
	);
	// append config variable is required
	if (params.appConfig) {
		const scssConfig = (
			'$readup-config:' +
			createScssObject(
				JSON.parse(
					fs
						.readFileSync(
							params.appConfig.path.replace('{env}', params.env)
						)
						.toString()
				)
			) +
			';\n\n'
		);
		stream = stream.pipe(
			insert.transform(
				(contents, file) => {
					file.path
					if (file.extname === '.scss') {
						return scssConfig + contents;
					}
					return contents;
				}
			)
		);
	}
	// compile and concat into a bundle
	stream = stream
		.pipe(
			sourcemaps.init()
		)
		.pipe(
			sass()
				.on('error', sass.logError)
		)
		.pipe(
			concat(params.fileName || 'bundle.css')
		);
	// retarget theme selectors if targeting shadow dom
	if (params.targetShadowDom) {
		stream = stream.pipe(
			insert.transform(
				contents => contents.replace(/:root((:not\()?\[data-com_readup_theme(=(light|dark))?\]\)?)/g, ':host($1)')
			)
		);
	}
	// write sourcemap
	if (
		(
			params.env === project.env.dev &&
			params.sourceMaps !== false
		) ||
		params.sourceMaps === true
	) {
		stream = stream.pipe(
			sourcemaps.write(
				'.',
				{
					sourceRoot: file => mapSourceRoot(file, params.dest)
				}
			)
		);
	}
	// minify
	if (params.env !== project.env.dev) {
		steam = stream.pipe(
			clean()
		);
	}
	// write output and signal completion
	return stream
		.pipe(
			dest(params.dest)
		)
		.on(
			'end',
			params.onComplete || function () { }
		);
}

module.exports = buildScss;