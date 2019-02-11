const del = require('del');

const
	project = require('../project'),
	reader = require('./nativeClient/reader'),
	shareExtension = require('./nativeClient/shareExtension');

function clean(env) {
	return del(project.getOutPath('native-client', env) + '/*');
}
function build(env) {
	return Promise.all([
		reader.build(env),
		shareExtension.build(env)
	]);
}
function watch() {
	reader.build();
	shareExtension.watch();
}

module.exports = {
	clean, build, watch
}