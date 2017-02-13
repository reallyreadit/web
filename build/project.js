const path = require('path');

const srcDir = 'src',
	  env = {
		  dev: 'dev',
		  stage: 'stage'
	  },
	  rootAbsPath = path.resolve(__dirname, '../');

function getOutPath(targetPath, env) {
	return path.posix.join('bin', env, targetPath);
}

module.exports = {
	srcDir, env, rootAbsPath, getOutPath
};