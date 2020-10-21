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
	webpack: {
		entry: path.posix.join(project.srcDir, 'embed/iframe/main.ts'),
		fileName: `bundle-${package['it.reallyread'].version.embedIframe}.js`
	},
	path: 'embed/iframe'
});

module.exports = build;