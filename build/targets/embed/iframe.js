const path = require('path');

const
	project = require('../../project'),
	createBuild = require('../../createBuild');

const build = createBuild({
	webpack: {
		entry: path.posix.join(project.srcDir, 'embed/iframe/main.ts')
	},
	path: 'embed/iframe'
});

module.exports = build;