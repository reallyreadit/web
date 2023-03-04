// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

const path = require('path');

const srcDir = 'src',
	env = {
		dev: 'dev',
		stage: 'stage',
		prod: 'prod',
	},
	rootAbsPath = path.resolve(__dirname, '../');

function getOutPath(targetPath, env) {
	return path.posix.join('bin', env, targetPath);
}

module.exports = {
	srcDir,
	env,
	rootAbsPath,
	getOutPath,
};
