const path = require('path');

const project = require('../../../project'),
	createBuild = require('../../../createBuild');

const build = createBuild({
	webpack: {
		entry: path.posix.join(project.srcDir, 'extension/content-scripts/web-app/main.ts')
	},
	path: 'extension/content-scripts/web-app'
});

module.exports = build;