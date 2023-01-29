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

const project = require('../project'),
	createBuild = require('../createBuild'),
	appConfigPath = path.posix.join(project.srcDir, 'embed/config.{env}.json'),
	iframe = require('./embed/iframe');

const packageData = JSON.parse(fs.readFileSync('./package.json').toString());

const embed = createBuild({
	path: 'embed',
	scss: {
		appConfig: {
			path: appConfigPath,
		},
		fileName: `bundle-${packageData['it.reallyread'].version.embed}.css`,
		files: [
			`${project.srcDir}/common/components/**/*.{css,scss}`,
			`${project.srcDir}/common/styles/reset.css`,
			`${project.srcDir}/common/styles/shadow-host.scss`,
			`${project.srcDir}/embed/**/*.{css,scss}`,
		],
		targetShadowDom: true,
	},
	webpack: {
		appConfig: {
			path: appConfigPath,
			key: 'window.reallyreadit.embed.config',
		},
		entry: path.posix.join(project.srcDir, 'embed/main.ts'),
		fileName: `bundle-${packageData['it.reallyread'].version.embed}.js`,
	},
});

function clean(env) {
	return embed.clean(env);
}
function build(env) {
	return Promise.all([embed.build(env), iframe.build(env)]);
}
function watch() {
	embed.watch();
	iframe.watch();
}

module.exports = {
	clean,
	build,
	watch,
};
