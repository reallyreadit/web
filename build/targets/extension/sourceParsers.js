const del = require('del');

const project = require('../../project'),
	  delayedWatch = require('../../delayedWatch'),
	  buildTypescript = require('../../buildTypescript'),
	  tsConfig = require('../../../tsconfig.json');

const srcGlob = [
		`${project.srcDir}/extension/content-script/source-parsers/**/*.ts`,
		`${project.srcDir}/extension/content-script/Window.d.ts`
	  ],
	  targetPath = 'extension/source-parsers';

function clean(env) {
	return del(project.getOutPath(targetPath, env) + '/*');
}
function build(env) {
	return buildTypescript({
		src: srcGlob,
		dest: project.getOutPath(targetPath, env),
		compilerOptions: tsConfig.compilerOptions
	});
}
function watch() {
	return delayedWatch(srcGlob, () => build(project.env.dev));
}

module.exports = {
	clean, build, watch
};