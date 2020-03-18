const path = require('path');

const
	project = require('../../../../project'),
	createBuild = require('../../../../createBuild');

const build = createBuild({
	path: 'extension/content-scripts/reader/content-parser',
	webpack: {
		entry: path.posix.join(project.srcDir, 'extension/content-scripts/reader/content-parser/main.ts')
	}
});

module.exports = build;