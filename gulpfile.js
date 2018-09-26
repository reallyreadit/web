const gulp = require('gulp'),
	  project = require('./build/project'),
	  Server = require('./build/targets/Server'),
	  client = require('./build/targets/client'),
	  extension = require('./build/targets/extension');

/**
 * app
 */
gulp.task('clean:dev:app', ['clean:dev:server', 'clean:dev:browser']);
gulp.task('build:dev:app', ['build:dev:server', 'build:dev:browser']);
gulp.task('run:dev:app', ['run:dev:server', 'build:dev:browser']);
gulp.task('watch:dev:app', ['watch:dev:server', 'watch:dev:browser']);

gulp.task('clean:stage:app', ['clean:stage:server', 'clean:stage:browser']);
gulp.task('build:stage:app', ['build:stage:server', 'build:stage:browser']);

gulp.task('clean:prod:app', ['clean:prod:server', 'clean:prod:browser']);
gulp.task('build:prod:app', ['build:prod:server', 'build:prod:browser']);

const server = new Server();
gulp.task('clean:dev:server', () => server.clean(project.env.dev));
gulp.task('build:dev:server', () => server.build(project.env.dev));
gulp.task('run:dev:server', ['build:dev:server'], server.run);
gulp.task('watch:dev:server', ['run:dev:server'], server.watch);

gulp.task('clean:stage:server', () => server.clean(project.env.stage));
gulp.task('build:stage:server', () => server.build(project.env.stage));

gulp.task('clean:prod:server', () => server.clean(project.env.prod));
gulp.task('build:prod:server', () => server.build(project.env.prod));

gulp.task('clean:dev:browser', () => client.clean(project.env.dev));
gulp.task('build:dev:browser', () => client.build(project.env.dev));
gulp.task('watch:dev:browser', client.watch);

gulp.task('clean:stage:browser', () => client.clean(project.env.stage));
gulp.task('build:stage:browser', () => client.build(project.env.stage));

gulp.task('clean:prod:browser', () => client.clean(project.env.prod));
gulp.task('build:prod:browser', () => client.build(project.env.prod));

/**
 * extension
 */
gulp.task('clean:dev:extension', () => extension.clean(project.env.dev));
gulp.task('build:dev:extension', () => extension.build(project.env.dev));
gulp.task('watch:dev:extension', () => extension.watch());

gulp.task('clean:stage:extension', () => extension.clean(project.env.stage));
gulp.task('build:stage:extension', () => extension.build(project.env.stage));

gulp.task('clean:prod:extension', () => extension.clean(project.env.prod));
gulp.task('build:prod:extension', () => extension.build(project.env.prod));