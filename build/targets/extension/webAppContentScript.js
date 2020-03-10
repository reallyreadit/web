const path = require('path');

const project = require('../../project'),
	createBuild = require('../../createBuild');

const build = createBuild({
	webpack: {
		entry: path.posix.join(project.srcDir, 'extension/web-app-content-script/main.ts')
	},
	path: 'extension/web-app-content-script'
});

module.exports = build;