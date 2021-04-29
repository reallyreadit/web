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
	path: 'common/reading',
	webpack: {
		entry: path.posix.join(project.srcDir, 'common/reading/parseDocumentMetadata.ts'),
		fileName: `metadata-parser-${package['it.reallyread'].version.common.metadataParser}.js`,
		sourceMaps: false,
		minify: false,
		outputLibrary: 'metadataParser'
	}
});

module.exports = build;