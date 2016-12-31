const path = require('path');

const srcDir = 'src',
	  binDir = 'bin',
	  devPath = path.posix.join(binDir, 'dev'),
	  rootAbsPath = path.resolve(__dirname, '../');

module.exports = {
	srcDir, binDir, devPath, rootAbsPath
};