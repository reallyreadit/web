const fs = require('fs');

module.exports = cssFilePath => {
	fs.writeFileSync(
		cssFilePath,
		fs
			.readFileSync(cssFilePath)
			.toString()
			.replace(/:root(:not\()?\[data-com_readup_theme(=(light|dark))?\]\)?/g, ':host-context($&)')
	);
};