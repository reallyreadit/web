const path = require('path');

const project = require('../../project'),
	  createBuild = require('../../createBuild');

const build = createBuild({
	webpack: {
		configFileName: 'tsconfig.extension.event-page.json',
		entry: path.posix.join(project.srcDir, 'extension/event-page/main.ts')
	},
	staticAssets: `${project.srcDir}/extension/{event-page,common}/**/*.{html,ttf}`,
	srcPath: path.posix.join(project.srcDir, 'extention/event-page'),
	outPath: path.posix.join(project.devPath, 'extension/event-page')
});

module.exports = build;