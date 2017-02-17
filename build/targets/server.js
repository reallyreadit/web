const path = require('path'),
	  del = require('del'),
	  childProcess = require('child_process');

const project = require('../project'),
	  delayedWatch = require('../delayedWatch'),
	  buildTypescript = require('../buildTypescript'),
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
		return del(project.getOutPath(targetPath, env) + '/*');
	}
	build(env) {
		return buildTypescript({
			src: srcGlob,
			dest: project.getOutPath(targetPath, env),
			sourceMaps: env === project.env.dev,
			compilerOptions: tsConfig.compilerOptions
		});
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
				.on('exit', () => this.build(project.env.dev).on('end', this.run))
				.kill()
		);
	}
}

module.exports = Server;