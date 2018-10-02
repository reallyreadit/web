const
	log = require('fancy-log'),
	PluginError = require('plugin-error'),
	webpack = require('webpack');

function runWebpack(config, onComplete) {
	webpack(config, (error, stats) => {
		if (error) {
			throw new PluginError('webpack', error);
		}
		log(stats.toString({
			chunks: false,
			colors: true
		}));
		if (onComplete) {
			onComplete(config);
		}
	});
}

module.exports = runWebpack;