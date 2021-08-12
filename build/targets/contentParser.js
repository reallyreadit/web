const
	fs = require('fs'),
	path = require('path');

const
	project = require('../project'),
	createBuild = require('../createBuild');

const package = JSON.parse(
	fs
		.readFileSync('./package.json')
		.toString()
);

const build = createBuild({
	path: 'common/contentParsing',
	webpack: {
		entry: path.posix.join(project.srcDir, 'common/contentParsing/parseDocumentContent.ts'),
		fileName: `content-parser-${package['it.reallyread'].version.common.contentParser}.js`,
		sourceMaps: false,
		minify: false,
		outputLibrary: 'contentParser'
	}
});

module.exports = build;