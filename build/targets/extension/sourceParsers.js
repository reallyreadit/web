const path = require('path'),
	  del = require('del');

const project = require('../../project'),
	  delayedWatch = require('../../delayedWatch'),
	  buildTypescript = require('../../buildTypescript'),
	  tsConfig = require('../../../tsconfig.json');

const srcGlob = [
		`${project.srcDir}/extension/source-parsers/**/*.ts`,
		`${project.srcDir}/extension/common/Window.d.ts`
	  ],
	  outPath = path.posix.join(project.devPath, 'extension/source-parsers');

function clean() {
	return del(`${outPath}/*`);
}
function build() {
	return buildTypescript({
		src: srcGlob,
		dest: outPath,
		compilerOptions: tsConfig.compilerOptions
	});
}
function watch() {
	return delayedWatch(srcGlob, build);
}

module.exports = {
	clean, build, watch
};