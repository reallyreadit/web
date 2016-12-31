const gulp = require('gulp'),
	  Server = require('./build/targets/server.js'),
	  browser = require('./build/targets/browser.js');

/**
 * dev
 */
gulp.task('clean:dev', ['clean:dev:server', 'clean:dev:browser']);
gulp.task('build:dev', ['build:dev:server', 'build:dev:browser']);
gulp.task('run:dev', ['run:dev:server', 'build:dev:browser']);
gulp.task('watch:dev', ['watch:dev:server', 'watch:dev:browser']);

/**
 * dev/server
 */
const server = new Server();
gulp.task('clean:dev:server', server.clean);
gulp.task('build:dev:server', server.build);
gulp.task('run:dev:server', ['build:dev:server'], server.run);
gulp.task('watch:dev:server', ['run:dev:server'], server.watch);

/**
 * dev/browser
 */
gulp.task('clean:dev:browser', browser.clean);
gulp.task('build:dev:browser', browser.build);
gulp.task('watch:dev:browser', browser.watch);