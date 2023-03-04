// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

const ansiColors = require('ansi-colors'),
	log = require('fancy-log'),
	{ watch } = require('gulp');

const watchEventColors = {
	add: ansiColors.green,
	addDir: ansiColors.green,
	change: ansiColors.yellow,
	unlink: ansiColors.red,
	unlinkDir: ansiColors.red,
};

module.exports = function (globs, task) {
	task();
	const watcher = watch(globs, task);
	watcher.on('all', (eventName, path) => {
		log(
			`${watchEventColors[eventName](`[${eventName}]`)} ${ansiColors.cyan(
				path
			)}`
		);
	});
	return watcher;
};
