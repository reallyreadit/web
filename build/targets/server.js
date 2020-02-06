const
	path = require('path'),
	del = require('del'),
	childProcess = require('child_process'),
	project = require('../project'),
	buildStaticAssets = require('../buildStaticAssets'),
	TscWatchClient = require('tsc-watch/client'),
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
			new Promise(
				resolve => {
					const args = [
						'--project',
						'tsconfig.server.json',
						'--outDir',
						project.getOutPath(targetPath, env)
					];
					if (env === project.env.dev) {
						args.push('--incremental');
						args.push('--sourcemap');
					}
					childProcess
						.spawn(
							'tsc',
							args,
							{
								shell: true,
								stdio: 'inherit'
							}
						)
						.on('exit', resolve);
				}
			)
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
			tasks.push(new Promise((resolve, reject) => buildStaticAssets({
				src: 'package.json',
				dest: project.getOutPath('app', env),
				onComplete: resolve
			})));
		}
		return Promise.all(tasks);
	}
	run() {
		this.serverProcess = childProcess.spawn(
			'node',
			[
				'--inspect',
				'--no-lazy',
				path.join(project.getOutPath(targetPath, project.env.dev), 'app/server/main.js')
			],
			{
				stdio: 'inherit'
			}
		);
		return Promise.resolve();
	}
	watch() {
		const watcher = new TscWatchClient();
		watcher.on(
			'success',
			() => {
				if (this.serverProcess) {
					this.serverProcess
						.on(
							'exit',
							() => {
								this.run();
							}
						)
						.kill();
				} else {
					this.run();
				}
			}
		);
		watcher.start(
			...[
				'--project',
				'tsconfig.server.json',
				'--outDir',
				project.getOutPath(targetPath, project.env.dev),
				'--incremental',
				'--sourcemap'
			]
		);
		return Promise.resolve();
	}
}

module.exports = Server;