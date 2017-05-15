const webpack = require('webpack'),
	  util = require('gulp-util');

function runWebpack(config, onComplete) {
	webpack(config, (error, stats) => {
		if (error) {
			throw new util.PluginError('webpack', error);
		}
		util.log(stats.toString({
			chunks: false,
			colors: true
		}));
		if (onComplete) {
			onComplete(config);
		}
	});
}

module.exports = runWebpack;