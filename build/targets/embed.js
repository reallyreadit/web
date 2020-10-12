const path = require('path');

const
	project = require('../project'),
	createBuild = require('../createBuild'),
	appConfigPath = path.posix.join(project.srcDir, 'embed/config.{env}.json'),
	iframe = require('./embed/iframe');

const embed = createBuild({
	path: 'embed',
	scss: {
		appConfig: {
			path: appConfigPath
		},
		files: [
			`${project.srcDir}/common/components/**/*.{css,scss}`,
			`${project.srcDir}/common/styles/reset.css`,
			`${project.srcDir}/common/styles/shadow-host.scss`,
			`${project.srcDir}/embed/**/*.{css,scss}`
		],
		targetShadowDom: true
	},
	webpack: {
		appConfig: {
			path: appConfigPath,
			key: 'window.reallyreadit.embed.config'
		},
		entry: path.posix.join(project.srcDir, 'embed/main.ts')
	}
});

function clean(env) {
	return embed.clean(env);
}
function build(env) {
	return Promise.all([
		embed.build(env),
		iframe.build(env)
	]);
}
function watch() {
	embed.watch();
	iframe.watch();
}

module.exports = {
	clean, build, watch
}