const
	path = require('path'),
	del = require('del');

const
	project = require('../project'),
	createBuild = require('../createBuild'),
	authServiceLinkHandler = require('./client/authServiceLinkHandler');

const app = createBuild({
	webpack: {
		entry: path.posix.join(project.srcDir, 'app/client/main.ts')
	},
	scss: [
		`${project.srcDir}/app/{client,common}/**/*.{css,scss}`,
		`${project.srcDir}/common/**/*.{css,scss}`
	],
	staticAssets: [
		`${project.srcDir}/app/client/.well-known/**/*`,
		`${project.srcDir}/app/client/fonts/**/*`,
		`${project.srcDir}/app/client/images/**/*`
	],
	path: 'app/client'
});

function clean(env) {
	return del(project.getOutPath('app/client', env) + '/*');
}
function build(env) {
	return Promise.all([
		app.build(env),
		authServiceLinkHandler.build(env)
	]);
}
function watch() {
	app.watch();
	authServiceLinkHandler.watch();
}

module.exports = {
	clean, build, watch
}