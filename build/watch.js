const
	ansiColors = require('ansi-colors'),
	log = require('fancy-log'),
	{ watch } = require('gulp');

const watchEventColors = {
	'add': ansiColors.green,
	'addDir': ansiColors.green,
	'change': ansiColors.yellow,
	'unlink': ansiColors.red,
	'unlinkDir': ansiColors.red
};

module.exports = function (globs, task) {
	task();
	const watcher = watch(globs, task);
	watcher.on(
		'all',
		(eventName, path) => {
			log(`${watchEventColors[eventName](`[${eventName}]`)} ${ansiColors.cyan(path)}`);
		}
	);
	return watcher;
};