const path = require('path');

const
	project = require('../../project'),
	createBuild = require('../../createBuild');

const build = createBuild({
	webpack: {
		entry: path.posix.join(project.srcDir, 'app/client/auth-service-link-handler/main.ts')
	},
	staticAssets: [
		`${project.srcDir}/app/client/auth-service-link-handler/index.html`
	],
	path: 'app/client/auth-service-link-handler'
});

module.exports = build;