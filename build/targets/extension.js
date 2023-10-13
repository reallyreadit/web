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
const { src, dest } = require('gulp');

const project = require('../project');
const createBuild = require('../createBuild');
const createReaderContentScriptBuild = require('./extension/contentScripts/reader');
const createEventPageBuild = require('./extension/eventPage');
const createOptionsPageBuild = require('./extension/optionsPage');
const createWebAppContentScriptBuild = require('./extension/contentScripts/webApp');
const createAlertContentScriptBuild = require('./extension/contentScripts/alert');

const
	targetPath = 'extension',
	outputPath = path.posix.join(targetPath, 'output'),
	browsersPath = path.posix.join(targetPath, 'browsers'),
	buildParams = {
		path: outputPath,
		onBuildComplete: (buildInfo, resolve) => {
			copyOutputToBrowsersDirectories(buildInfo, null, null, resolve);
		}
	};

function getBrowsersAbsPath(env) {
	return project.getOutPath(browsersPath, env);
}
function getBrowserManifestEntries(dirPath) {
	const
		manifestRegex = /^manifest\.(.+)\.json$/,
		manifests = [];
	for (const dirEnt of fs.readdirSync(dirPath, { withFileTypes: true })) {
		let match;
		if (!dirEnt.isFile() || !(match = dirEnt.name.match(manifestRegex))) {
			continue;
		}
		manifests.push({
			fileName: dirEnt.name,
			filePath: path.posix.join(dirPath, dirEnt.name),
			browserName: match[1]
		});
	}
	return manifests;
}
function createBrowsersDirectories(env) {
	const browsersAbsPath = getBrowsersAbsPath(env);
	for (const entry of getBrowserManifestEntries(path.posix.join(project.srcDir, 'extension'))) {
		fs.mkdirSync(path.posix.join(browsersAbsPath, entry.browserName), { recursive: true });
	}
}
function copyOutputToBrowsersDirectories(buildInfo, callback, options, resolve) {
	const
		browsersAbsPath = getBrowsersAbsPath(buildInfo.env),
		browserDirs = fs.readdirSync(browsersAbsPath, { withFileTypes: true }),
		outputAbsPath = project.getOutPath(outputPath, buildInfo.env),
		copyOps = [];
	for (const dirEnt of browserDirs) {
		if (!dirEnt.isDirectory()) {
			continue;
		}
		const destAbsPath = path.posix.join(browsersAbsPath, dirEnt.name, options?.preserveAncestorDirectoryStructure === false ? '' : path.relative(outputAbsPath, buildInfo.outPath));
		let copyOp = new Promise(resolve => {
			src(path.posix.join(buildInfo.outPath, '**', '*'))
				.pipe(dest(destAbsPath))
				.on('end', resolve);
		});
		if (callback) {
			copyOp = copyOp.then(() => { callback(dirEnt.name, destAbsPath); });
		}
		copyOps.push(copyOp);
	}
	Promise
		.all(copyOps)
		.then(resolve);
}
function readJsonData(filePath) {
	return JSON.parse(fs.readFileSync(filePath).toString());
}
function transformJsonFile(filePath, transform) {
	fs.writeFileSync(filePath, JSON.stringify(transform(readJsonData(filePath)), null, 3));
}

const staticAssets = createBuild({
	onBuildComplete: (buildInfo, resolve) => {
		// Update manifest
		const
			packageData = readJsonData('./package.json'),
			config = readJsonData(path.posix.join(project.srcDir, `extension/common/config.${buildInfo.env}.json`)),
			webUrlPattern = `${config.webServer.protocol}://${config.webServer.host}/*`;
		transformJsonFile(
			path.posix.join(buildInfo.outPath, 'manifest.json'),
			manifest => {
				manifest.version = packageData['it.reallyread'].version.extension;
				manifest.content_scripts[0].matches.push(webUrlPattern);
				return manifest;
			}
		);
		// Copy output and create individual manifests
		copyOutputToBrowsersDirectories(
			buildInfo,
			(browser, outputAbsPath) => {
				for (const entry of getBrowserManifestEntries(outputAbsPath)) {
					if (entry.browserName === browser) {
						transformJsonFile(
							path.posix.join(outputAbsPath, 'manifest.json'),
							manifest => ({ ...manifest, ...readJsonData(entry.filePath) })
						);
					}
					fs.unlinkSync(entry.filePath);
				}
			},
			{ preserveAncestorDirectoryStructure: false },
			resolve
		);
	},
	path: path.posix.join(outputPath, 'static'),
	// TODO PROXY EXT: find a way to not assume base path from targetPath here in createBuild
	// based on an option? (especially in inner scripts)
	staticAssets: [
		{
			base: `${project.srcDir}/extension/`,
			src: [
				`${project.srcDir}/extension/content-scripts/ui/fonts/**`,
				`${project.srcDir}/extension/content-scripts/ui/images/**`,
				`${project.srcDir}/extension/icons/**`,
				`${project.srcDir}/extension/manifest.json`,
				`${project.srcDir}/extension/manifest.*.json`,
				`${project.srcDir}/extension/rules.json`,
			]
		},
		// We copy these into the root directory, to make the reader url look a little prettier
		// They are logically part of extension/content-scripts/
		// TODO: maybe rename this, since it's not really a 'content script' anymore.
		{
			base: `${project.srcDir}/extension/content-scripts/reader/`,
			src: [
				`${project.srcDir}/extension/content-scripts/reader/reader.html`,
			],
		},
	],
});

function clean(env) {
	return del(`${project.getOutPath(targetPath, env)}/*`);
}
function build(env) {
	createBrowsersDirectories(env);
	return Promise.all([
		createEventPageBuild(buildParams).build(env),
		// TODO PROXY EXT: do we still need the alertContentScript here?
		// Should we also remove the reader content script?
		createReaderContentScriptBuild(buildParams).build(env),
		createOptionsPageBuild(buildParams).build(env),
		staticAssets.build(env),
		createWebAppContentScriptBuild(buildParams).build(env),
		createAlertContentScriptBuild(buildParams).build(env),
	]);
}
function watch() {
	createBrowsersDirectories(project.env.dev);
	return Promise.all([
		createReaderContentScriptBuild(buildParams).watch(),
		createEventPageBuild(buildParams).watch(),
		createOptionsPageBuild(buildParams).watch(),
		staticAssets.watch(),
		createWebAppContentScriptBuild(buildParams).watch(),
		createAlertContentScriptBuild(buildParams).watch(),
	]);
}

module.exports = {
	clean,
	build,
	watch,
};
