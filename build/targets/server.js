const path = require('path'),
	  del = require('del'),
	  childProcess = require('child_process');

const project = require('../project'),
	  delayedWatch = require('../delayedWatch'),
	  buildTypescript = require('../buildTypescript'),
	  tsConfig = require('../../tsconfig.json');

const srcGlob = `${project.srcDir}/{server,common}/**/*.{ts,tsx}`,
	  outPath = path.posix.join(project.devPath, 'server');

class Server {
	constructor() {
		this.clean = this.clean.bind(this);
		this.build = this.build.bind(this);
		this.run = this.run.bind(this);
		this.watch = this.watch.bind(this);
	}
	clean() {
		return del(`${outPath}/*`);
	}
	build() {
		return buildTypescript({
			src: srcGlob,
			dest: outPath,
			sourceMaps: true,
			compilerOptions: tsConfig.compilerOptions
		});
	}
	run() {
		this.process = childProcess
			.spawn('node', [
				'--debug',
				'--no-lazy',
				path.join(outPath, 'server/main.js')
			], {
				stdio: 'inherit',
				env: {
					NODE_ENV: 'development'
				}
			});
	}
	watch() {
		return delayedWatch(
			srcGlob, 
			() => this.process
				.on('exit', () => this.build().on('end', this.run))
				.kill()
		);
	}
}

module.exports = Server;