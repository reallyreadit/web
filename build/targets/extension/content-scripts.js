const path = require('path');

const project = require('../../project'),
	  createBuild = require('../../createBuild');

const build = createBuild({
	webpack: {
		configFileName: 'tsconfig.extension.content-scripts.json',
		entry: path.posix.join(project.srcDir, 'extension/content-scripts/main.ts')
	},
	srcPath: path.posix.join(project.srcDir, 'extension/content-scripts'),
	outPath: path.posix.join(project.devPath, 'extension/content-scripts')
});

module.exports = build;