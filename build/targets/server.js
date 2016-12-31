const gulp = 		 require('gulp'),
	  sourcemaps = 	 require('gulp-sourcemaps'),
	  typeScript =	 require('gulp-typescript'),
	  path = 		 require('path'),
	  del = 		 require('del'),
	  childProcess = require('child_process'),
	  changed =		 require('gulp-changed');

const project = require('../project'),
	  delayedWatch = require('../delayedWatch'),
	  tsConfig = require('../../tsconfig.json');

const srcGlob = `${project.srcDir}/{server,common}/**/*.{ts,tsx}`,
	  devPath = path.posix.join(project.devPath, 'server'),
	  tsProject = typeScript.createProject(tsConfig.compilerOptions);

class Server {
	constructor() {
		this.clean = this.clean.bind(this);
		this.build = this.build.bind(this);
		this.run = this.run.bind(this);
		this.watch = this.watch.bind(this);
	}
	clean() {
		return del(`${devPath}/*`);
	}
	build() {
		return gulp
			.src(srcGlob)
			.pipe(changed(devPath, { extension: '.js' }))
			.pipe(sourcemaps.init())
			.pipe(tsProject())
			.pipe(sourcemaps.write('.', {
				includeContent: false,
				sourceRoot: path.relative(devPath, project.srcDir)
			}))
			.pipe(gulp.dest(devPath));
	}
	run() {
		this.process = childProcess
			.spawn('node', [
				'--debug',
				'--no-lazy',
				path.join(devPath, 'server/main.js')
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