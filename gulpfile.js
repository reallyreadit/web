const gulp = require('gulp'),
	  Server = require('./build/targets/Server.js'),
	  browser = require('./build/targets/browser.js'),
	  extension = require('./build/targets/extension');

/**
 * app
 */
gulp.task('clean:dev:app', ['clean:dev:server', 'clean:dev:browser']);
gulp.task('build:dev:app', ['build:dev:server', 'build:dev:browser']);
gulp.task('run:dev:app', ['run:dev:server', 'build:dev:browser']);
gulp.task('watch:dev:app', ['watch:dev:server', 'watch:dev:browser']);

const server = new Server();
gulp.task('clean:dev:server', server.clean);
gulp.task('build:dev:server', server.build);
gulp.task('run:dev:server', ['build:dev:server'], server.run);
gulp.task('watch:dev:server', ['run:dev:server'], server.watch);

gulp.task('clean:dev:browser', browser.clean);
gulp.task('build:dev:browser', browser.build);
gulp.task('watch:dev:browser', browser.watch);

/**
 * extension
 */
gulp.task('clean:dev:extension', extension.clean);
gulp.task('build:dev:extension', extension.build);
gulp.task('watch:dev:extension', extension.watch);