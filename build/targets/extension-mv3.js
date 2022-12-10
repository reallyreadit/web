// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

const
	del = require('del'),
	fs = require('fs'),
	path = require('path');

const
	project = require('../project'),
	createBuild = require('../createBuild'),
	readerContentScript = require('./extension-common/contentScripts/reader'),
	serviceWorker = require('./extension-mv3/serviceWorker'),
	// The target path for these "leave node" builds can be configured by passing a parameter
	optionsPage = require('./extension-common/optionsPage')('extension-mv3/options-page'),
	webAppContentScript = require('./extension-common/contentScripts/webApp')('extension-mv3/content-scripts/web-app'),
	alertContentScript = require('./extension-common/contentScripts/alert')('extension-mv3/content-scripts/alert');

const
	targetPath = 'extension-mv3',
	staticAssets = createBuild({
		onBuildComplete: (buildInfo, resolve) => {
			// Update manifest

			if ((buildInfo.src != null) &&
				!(
					typeof buildInfo.src == 'string'
					&& buildInfo.src.endsWith('manifest.json')
				)) {
				// On build, this function gets called twice.
				// Ignore the onBuildComplete called when the static asset batch with base
				// `${project.srcDir}/extension` has completed

				// On watch, somehow this onBuildComplete gets calle once, without src param.
				// In that case, just let the update happen.
				return;
			}

			const
				manifestFileName = path.posix.join(buildInfo.outPath, '/manifest.json'),
				manifest = JSON.parse(
					fs
						.readFileSync(manifestFileName)
						.toString()
				),
				package = JSON.parse(
					fs
						.readFileSync('./package.json')
						.toString()
				),
				config = JSON.parse(
					fs
						.readFileSync(path.posix.join(project.srcDir, `extension/common/config.${buildInfo.env}.json`))
						.toString()
				),
				webUrlPattern = config.webServer.protocol + '://' + config.webServer.host + '/*';
			manifest.version = package['it.reallyread'].version.extension;
			manifest.content_scripts[0].matches.push(webUrlPattern);
			manifest.host_permissions.push(webUrlPattern);
			const manifestOutFilename = path.posix.join(buildInfo.outPath, 'manifest.json')
			fs.writeFileSync(
				manifestOutFilename,
				JSON.stringify(manifest, null, 3)
			);
			if (resolve) {
				resolve();
			}
		},
		path: targetPath,
		// TODO PROXY EXT: find a way to not assume base path from targetPath here in createBuild
		// based on an option? (especially in inner scripts)
		staticAssets: [
			{
				base: `${project.srcDir}/extension`,
				src: [
					`${project.srcDir}/extension/content-scripts/ui/fonts/**`,
					`${project.srcDir}/extension/content-scripts/ui/images/**`,
					`${project.srcDir}/extension/icons/**`
				]
			},
			{
				base: `${project.srcDir}/extension/mv3`,
				src: `${project.srcDir}/extension/mv3/manifest.json`,
			},
		]
	});

function clean(env) {
	return del(project.getOutPath(targetPath, env) + '/*');
}

const readerTargetPath = 'extension-mv3/content-scripts/reader'
function build(env) {
	readerContentScript.setTargetPath(readerTargetPath);
	return Promise.all([
		serviceWorker.build(env),
		// TODO PROXY EXT: do we still need the alertContentScript here?
		// Should we also remove the reader content script?
		readerContentScript.build(env),
		optionsPage.build(env),
		staticAssets.build(env),
		webAppContentScript.build(env),
		alertContentScript.build(env)
	]);
}
function watch() {
	readerContentScript.setTargetPath(readerTargetPath);
	readerContentScript.watch();
	serviceWorker.watch();
	optionsPage.watch();
	staticAssets.watch();
	webAppContentScript.watch();
	alertContentScript.watch();
}

module.exports = {
	clean, build, watch
}