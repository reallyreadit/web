const
	ansiColors = require('ansi-colors'),
	log = require('fancy-log'),
	gulp = require('gulp');

const watchEventColors = {
	added: ansiColors.green,
	changed: ansiColors.yellow,
	deleted: ansiColors.red,
	renamed: ansiColors.yellow
};

function delayedWatch(globs, delegate) {
	let timeout;
	return gulp.watch(globs, event => {
		log(`${watchEventColors[event.type](`[${event.type}]`)} ${ansiColors.cyan(event.path)}`);
		if (event.type === 'changed' || event.type === 'renamed') {
			clearTimeout(timeout);
			timeout = setTimeout(delegate, 500);
		}
	});
}

module.exports = delayedWatch;