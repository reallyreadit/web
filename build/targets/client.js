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
	path = require('path'),
	del = require('del'),
	fs = require('fs');

const
	project = require('../project'),
	createBuild = require('../createBuild'),
	authServiceLinkHandler = require('./client/authServiceLinkHandler'),
	appConfigPath = path.posix.join(project.srcDir, 'app/server/config.{env}.json');

const package = JSON.parse(
	fs
		.readFileSync('./package.json')
		.toString()
);

const app = createBuild({
	webpack: {
		entry: path.posix.join(project.srcDir, 'app/client/main.ts'),
		fileName: `bundle-${package['it.reallyread'].version.app}.js`
	},
	scss: {
		appConfig: {
			path: appConfigPath
		},
		fileName: `bundle-${package['it.reallyread'].version.app}.css`,
		files: [
			`${project.srcDir}/app/**/*.{css,scss}`,
			`${project.srcDir}/common/components/**/*.{css,scss}`,
			`${project.srcDir}/common/styles/reset.css`
		]
	},
	staticAssets: [
		`${project.srcDir}/app/client/.well-known/**/*`
	],
	templates: {
		data: env => {
			let staticServerUrl;
			switch (env) {
				case project.env.dev:
					staticServerUrl = 'https://static.dev.readup.org';
					break;
				case project.env.prod:
					staticServerUrl = 'https://static.readup.org';
					break;
				default:
					throw new Error('Unexpected environment');
			}
			return {
				'embed_iframe_version': package['it.reallyread'].version.embedIframe,
				'static_server_url': staticServerUrl
			};
		},
		extension: '.html',
		files: [
			`${project.srcDir}/app/client/embed-iframe-bridge/index.mustache`,
		]
	},
	path: 'app/client'
});

function clean(env) {
	return del(project.getOutPath('app/client', env));
}
function build(env) {
	return Promise.all([
		app.build(env),
		authServiceLinkHandler.build(env)
	]);
}
function watch() {
	app.watch();
	authServiceLinkHandler.watch();
}

module.exports = {
	clean, build, watch
}