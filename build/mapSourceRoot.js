const path = require('path');

const project = require('./project');

function mapSourceRoot(sourceFile, destDir) {
	return path.join(path.relative(path.join(destDir, path.dirname(sourceFile.relative)), '.'), project.srcDir);
}

module.exports = mapSourceRoot;