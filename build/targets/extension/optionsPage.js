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

const project = require('../../project'),
	  createBuild = require('../../createBuild'),
	  appConfigPath = path.posix.join(project.srcDir, 'extension/common/config.{env}.json');

const build = createBuild({
	scss: {
		appConfig: {
			path: appConfigPath
		},
		fileName: `bundle.css`,
		files: [

			// ------
			// TODO: to shrink package size: instead of including all components, we only included the used ones here.
			// Even more efficient would be separate component SCSS used by other extension code as well (the Alert e.g.),
			// and reuse it from a single file.
			// `${project.srcDir}/common/components/**/*.{css,scss}`,
			`${project.srcDir}/common/components/Icon.scss`,
			`${project.srcDir}/common/components/SaveIndicator.scss`,
			`${project.srcDir}/common/components/SpinnerIcon.scss`,
			`${project.srcDir}/common/components/ToggleSwitch*.scss`,
			// ------
			`${project.srcDir}/common/styles/reset.css`,
			`${project.srcDir}/extension/options-page/**/*.{css,scss}`,
		],
		sourceMaps: false
	},
	webpack: {
		entry: path.posix.join(project.srcDir, 'extension/options-page/main.ts'),
		appConfig: {
			path: appConfigPath,
			key: 'window.reallyreadit.extension.config'
		},
		sourceMaps: false
	},
	staticAssets: [
		`${project.srcDir}/extension/options-page/index.html`
	],
	path: 'extension/options-page'
});

module.exports = build;