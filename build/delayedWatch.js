const gulp = require('gulp'),
	  util = require('gulp-util');

const watchEventColors = {
	added: 'green',
	changed: 'yellow',
	deleted: 'red',
	renamed: 'yellow'
};

function delayedWatch(globs, delegate) {
	let timeout;
	return gulp.watch(globs, event => {
		util.log(`${util.colors[watchEventColors[event.type]](`[${event.type}]`)} ${util.colors.cyan(event.path)}`);
		if (event.type === 'changed' || event.type === 'renamed') {
			clearTimeout(timeout);
			timeout = setTimeout(delegate, 500);
		}
	});
}

module.exports = delayedWatch;