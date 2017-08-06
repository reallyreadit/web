const path = require('path'),
	  del = require('del'),
	  childProcess = require('child_process');

const project = require('../project'),
	  delayedWatch = require('../delayedWatch'),
	  buildTypescript = require('../buildTypescript'),
	  buildStaticAssets = require('../buildStaticAssets'),
	  tsConfig = require('../../tsconfig.json');

const srcGlob = [
		  `${project.srcDir}/app/{server,common}/**/*.{ts,tsx}`,
		  `${project.srcDir}/common/**/*.{ts,tsx}`
	  ],
	  targetPath = 'app/server';

class Server {
	constructor() {
		this.clean = this.clean.bind(this);
		this.build = this.build.bind(this);
		this.run = this.run.bind(this);
		this.watch = this.watch.bind(this);
	}
	clean(env) {
		return del([
			project.getOutPath(targetPath, env),
			path.posix.join(project.getOutPath('app', env), 'web.config'),
			path.posix.join(project.getOutPath('app', env), 'npm-shrinkwrap.json')
		]);
	}
	build(env) {
		const tasks = [
			new Promise((resolve, reject) => buildTypescript({
				src: srcGlob,
				dest: project.getOutPath(targetPath, env),
				sourceMaps: env === project.env.dev,
				compilerOptions: tsConfig.compilerOptions,
				onComplete: resolve
			}))
		];
		if (env === project.env.prod) {
			tasks.push(new Promise((resolve, reject) => buildStaticAssets({
				src: `${project.srcDir}/app/web.config`,
				dest: project.getOutPath('app', env),
				base: `${project.srcDir}/app`,
				onComplete: resolve
			})));
			tasks.push(new Promise((resolve, reject) => buildStaticAssets({
				src: 'npm-shrinkwrap.json',
				dest: project.getOutPath('app', env),
				onComplete: resolve
			})));
		}
		return Promise.all(tasks);
	}
	run() {
		this.process = childProcess
			.spawn('node', [
				'--debug',
				'--no-lazy',
				path.join(project.getOutPath(targetPath, project.env.dev), 'app/server/main.js')
			], { stdio: 'inherit' });
	}
	watch() {
		return delayedWatch(
			srcGlob, 
			() => this.process
				.on(
					'exit',
					() => this
						.build(project.env.dev)
						.then(() => this.run())
				)
				.kill()
		);
	}
}

module.exports = Server;