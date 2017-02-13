const path = require('path');

const project = require('../../project'),
	  createBuild = require('../../createBuild');

const build = createBuild({
	webpack: {
		configFileName: 'tsconfig.extension.content-script.json',
		entry: path.posix.join(project.srcDir, 'extension/content-script/main.ts')
	},
	path: 'extension/content-script'
});

module.exports = build;