// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

const fs = require('fs'),
	path = require('path');

const project = require('../../project'),
	createBuild = require('../../createBuild');

const packageData = JSON.parse(fs.readFileSync('./package.json').toString());

const build = createBuild({
	path: 'native-client/share-extension',
	webpack: {
		entry: path.posix.join(
			project.srcDir,
			'native-client/share-extension/main.ts'
		),
		fileName: `bundle-${packageData['it.reallyread'].version.nativeClient.shareExtension}.js`,
		sourceMaps: false,
	},
});

module.exports = build;
