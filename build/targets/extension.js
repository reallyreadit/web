// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

const del = require('del');
const fs = require('fs');
const path = require('path');

const project = require('../project');
const createBuild = require('../createBuild');
const readerContentScript = require('./extension-common/contentScripts/reader');
const eventPage = require('./extension/eventPage');
// The target path for these "leave node" builds can be configured by passing a parameter
const optionsPage = require('./extension-common/optionsPage')(
	'extension/options-page'
);
const webAppContentScript = require('./extension-common/contentScripts/webApp')(
	'extension/content-scripts/web-app'
);
const alertContentScript = require('./extension-common/contentScripts/alert')(
	'extension/content-scripts/alert'
);

const targetPath = 'extension';
const staticAssets = createBuild({
	onBuildComplete: (buildInfo, resolve) => {
		// update manifest
		const manifestFileName = path.posix.join(
			buildInfo.outPath,
			'manifest.json'
		);
		const manifest = JSON.parse(fs.readFileSync(manifestFileName).toString());
		const packageData = JSON.parse(
			fs.readFileSync('./package.json').toString()
		);
		const config = JSON.parse(
			fs
				.readFileSync(
					path.posix.join(
						project.srcDir,
						`extension/common/config.${buildInfo.env}.json`
					)
				)
				.toString()
		);
		const webUrlPattern = `${config.webServer.protocol}://${config.webServer.host}/*`;
		manifest.version = packageData['it.reallyread'].version.extension;
		manifest.content_scripts[0].matches.push(webUrlPattern);
		manifest.permissions.push(webUrlPattern);
		fs.writeFileSync(manifestFileName, JSON.stringify(manifest, null, 3));
		if (resolve) {
			resolve();
		}
	},
	path: targetPath,
	staticAssets: [
		`${project.srcDir}/extension/content-scripts/ui/fonts/**`,
		`${project.srcDir}/extension/content-scripts/ui/images/**`,
		`${project.srcDir}/extension/icons/**`,
		`${project.srcDir}/extension/manifest.json`,
		// We copy these into the root directory, to make the reader url look a little prettier
		// They are logically part of extension/content-scripts/
		// TODO: maybe rename this, since it's not really a 'content script' anymore.
		{
			base: `${project.srcDir}/extension/content-scripts/reader/`,
			src: [
				`${project.srcDir}/extension/content-scripts/reader/reader.html`,
				`${project.srcDir}/extension/content-scripts/reader/reader-dark.html`,
			],
		},
	],
});

function clean(env) {
	return del(`${project.getOutPath(targetPath, env)}/*`);
}

const readerTargetPath = 'extension/content-scripts/reader';
function build(env) {
	readerContentScript.setTargetPath(readerTargetPath);
	return Promise.all([
		eventPage.build(env),
		// TODO PROXY EXT: do we still need the alertContentScript here?
		// Should we also remove the reader content script?
		readerContentScript.build(env),
		optionsPage.build(env),
		staticAssets.build(env),
		webAppContentScript.build(env),
		alertContentScript.build(env),
	]);
}
function watch() {
	readerContentScript.setTargetPath(readerTargetPath);
	return Promise.all([
		readerContentScript.watch(),
		eventPage.watch(),
		optionsPage.watch(),
		staticAssets.watch(),
		webAppContentScript.watch(),
		alertContentScript.watch(),
	]);
}

module.exports = {
	clean,
	build,
	watch,
};
