const
	path = require('path'),
	del = require('del'),
	fs = require('fs');

const
	project = require('../project'),
	createBuild = require('../createBuild'),
	authServiceLinkHandler = require('./client/authServiceLinkHandler');

const package = JSON.parse(
	fs
		.readFileSync('./package.json')
		.toString()
);

const app = createBuild({
	webpack: {
		entry: path.posix.join(project.srcDir, 'app/client/main.ts')
	},
	scss: {
		files: [
			`${project.srcDir}/app/**/*.{css,scss}`,
			`${project.srcDir}/common/components/**/*.{css,scss}`,
			`${project.srcDir}/common/styles/reset.css`
		]
	},
	staticAssets: [
		`${project.srcDir}/app/client/.well-known/**/*`,
		`${project.srcDir}/app/client/fonts/**/*`,
		`${project.srcDir}/app/client/images/**/*`
	],
	templates: {
		data: env => {
			let staticServerUrl;
			switch (env) {
				case project.env.dev:
					staticServerUrl = 'https://static.dev.readup.com';
					break;
				case project.env.prod:
					staticServerUrl = 'https://static.readup.com';
					break;
				default:
					throw new Error('Unexpected environment');
			}
			return {
				'embed_iframe_version': package['it.reallyread'].version.embedIframe,
				'static_server_url': staticServerUrl
			};
		},
		extension: '.html',
		files: [
			`${project.srcDir}/app/client/embed-iframe-bridge/index.mustache`,
		]
	},
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