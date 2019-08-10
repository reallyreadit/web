const path = require('path');

const
	project = require('../../../project'),
	createBuild = require('../../../createBuild');

const build = createBuild({
	path: 'extension/content-script/content-parser',
	webpack: {
		entry: path.posix.join(project.srcDir, 'extension/content-script/content-parser/main.ts')
	}
});

module.exports = build;