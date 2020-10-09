const
	fs = require('fs'),
	path = require('path');

const
	project = require('../../project'),
	createBuild = require('../../createBuild');

const package = JSON.parse(
	fs
		.readFileSync('./package.json')
		.toString()
);

const build = createBuild({
	path: 'native-client/share-extension',
	webpack: {
		entry: path.posix.join(project.srcDir, 'native-client/share-extension/main.ts'),
		fileName: `bundle-${package['it.reallyread'].version.nativeClient.shareExtension}.js`,
		sourceMaps: false
	}
});

module.exports = build;