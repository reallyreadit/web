const
	{ parallel, series } = require('gulp'),
	project = require('./build/project'),
	Server = require('./build/targets/Server'),
	client = require('./build/targets/client'),
	embed = require('./build/targets/embed'),
	extension = require('./build/targets/extension'),
	nativeClientReader = require('./build/targets/nativeClient/reader'),
	nativeClientShareExtension = require('./build/targets/nativeClient/shareExtension'),
	metadataParser = require('./build/targets/metadataParser');

/**
 * app
 */
const server = new Server();
function cleanDevServer() {
	return server.clean(project.env.dev);
}
function buildDevServer() {
	return server.build(project.env.dev);
}

function cleanStageServer() {
	return server.clean(project.env.stage);
}
function buildStageServer() {
	return server.build(project.env.stage);
}

function cleanProdServer() {
	return server.clean(project.env.prod);
}
function buildProdServer() {
	return server.build(project.env.prod);
}

function cleanDevBrowser() {
	return client.clean(project.env.dev);
}
function buildDevBrowser() {
	return client.build(project.env.dev);
}

function cleanStageBrowser() {
	return client.clean(project.env.stage);
}
function buildStageBrowser() {
	return client.build(project.env.stage);
}

function cleanProdBrowser() {
	return client.clean(project.env.prod);
}
function buildProdBrowser() {
	return client.build(project.env.prod);
}

/**
 * embed
 */
function cleanDevEmbed() {
	return embed.clean(project.env.dev);
}
function buildDevEmbed() {
	return embed.build(project.env.dev);
}

function cleanProdEmbed() {
	return embed.clean(project.env.prod);
}
function buildProdEmbed() {
	return embed.build(project.env.prod);
}

/**
 * extension
 */
function cleanDevExtension() {
	return extension.clean(project.env.dev);
}
function buildDevExtension() {
	return extension.build(project.env.dev);
}

function cleanStageExtension() {
	return extension.clean(project.env.stage);
}
function buildStageExtension() {
	return extension.build(project.env.stage);
}

function cleanProdExtension() {
	return extension.clean(project.env.prod);
}
function buildProdExtension() {
	return extension.build(project.env.prod);
}

/**
 * metadataParser
 */
function cleanDevMetadataParser() {
	return metadataParser.clean(project.env.dev);
}
function buildDevMetadataParser() {
	return metadataParser.build(project.env.dev);
}

/**
 * native client reader
 */
function cleanDevNativeClientReader() {
	return nativeClientReader.clean(project.env.dev);
}
function buildDevNativeClientReader() {
	return nativeClientReader.build(project.env.dev);
}

function cleanStageNativeClientReader() {
	return nativeClientReader.clean(project.env.stage);
}
function buildStageNativeClientReader() {
	return nativeClientReader.build(project.env.stage);
}

function cleanProdNativeClientReader() {
	return nativeClientReader.clean(project.env.prod);
}
function buildProdNativeClientReader() {
	return nativeClientReader.build(project.env.prod);
}

/**
 * native client share extension
 */
function cleanDevNativeClientShareExtension() {
	return nativeClientShareExtension.clean(project.env.dev);
}
function buildDevNativeClientShareExtension() {
	return nativeClientShareExtension.build(project.env.dev);
}

function cleanStageNativeClientShareExtension() {
	return nativeClientShareExtension.clean(project.env.stage);
}
function buildStageNativeClientShareExtension() {
	return nativeClientShareExtension.build(project.env.stage);
}

function cleanProdNativeClientShareExtension() {
	return nativeClientShareExtension.clean(project.env.prod);
}
function buildProdNativeClientShareExtension() {
	return nativeClientShareExtension.build(project.env.prod);
}

module.exports = {
	'clean:dev:app': parallel(cleanDevServer, cleanDevBrowser),
	'build:dev:app': parallel(buildDevServer, buildDevBrowser),
	'run:dev:app': series(parallel(buildDevServer, buildDevBrowser), server.run),
	'watch:dev:app': parallel(client.watch, server.watch),
	'clean:stage:app': parallel(cleanStageServer, cleanStageBrowser),
	'build:stage:app': parallel(buildStageServer, buildStageBrowser),
	'clean:prod:app': parallel(cleanProdServer, cleanProdBrowser),
	'build:prod:app': parallel(buildProdServer, buildProdBrowser),
	'clean:dev:server': cleanDevServer,
	'build:dev:server': buildDevServer,
	'run:dev:server': series(buildDevServer, server.run),
	'watch:dev:server': server.watch,
	'clean:stage:server': cleanStageServer,
	'build:stage:server': buildStageServer,
	'clean:prod:server': cleanProdServer,
	'build:prod:server': buildProdServer,
	'clean:dev:browser': cleanDevBrowser,
	'build:dev:browser': buildDevBrowser,
	'watch:dev:browser': client.watch,
	'clean:stage:browser': cleanStageBrowser,
	'build:stage:browser': buildStageBrowser,
	'clean:prod:browser': cleanProdBrowser,
	'build:prod:browser': buildProdBrowser,
	'clean:dev:embed': cleanDevEmbed,
	'build:dev:embed': buildDevEmbed,
	'watch:dev:embed': embed.watch,
	'clean:prod:embed': cleanProdEmbed,
	'build:prod:embed': buildProdEmbed,
	'clean:dev:extension': cleanDevExtension,
	'build:dev:extension': buildDevExtension,
	'watch:dev:extension': extension.watch,
	'clean:stage:extension': cleanStageExtension,
	'build:stage:extension': buildStageExtension,
	'clean:prod:extension': cleanProdExtension,
	'build:prod:extension': buildProdExtension,
	'clean:dev:metadata-parser': cleanDevMetadataParser,
	'build:dev:metadata-parser': buildDevMetadataParser,
	'watch:dev:metadata-parser': metadataParser.watch,
	'clean:dev:native-client-reader': cleanDevNativeClientReader,
	'build:dev:native-client-reader': buildDevNativeClientReader,
	'watch:dev:native-client-reader': nativeClientReader.watch,
	'clean:stage:native-client-reader': cleanStageNativeClientReader,
	'build:stage:native-client-reader': buildStageNativeClientReader,
	'clean:prod:native-client-reader': cleanProdNativeClientReader,
	'build:prod:native-client-reader': buildProdNativeClientReader,
	'clean:dev:native-client-share-extension': cleanDevNativeClientShareExtension,
	'build:dev:native-client-share-extension': buildDevNativeClientShareExtension,
	'watch:dev:native-client-share-extension': nativeClientShareExtension.watch,
	'clean:stage:native-client-share-extension': cleanStageNativeClientShareExtension,
	'build:stage:native-client-share-extension': buildStageNativeClientShareExtension,
	'clean:prod:native-client-share-extension': cleanProdNativeClientShareExtension,
	'build:prod:native-client-share-extension': buildProdNativeClientShareExtension
};