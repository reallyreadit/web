import * as React from 'react';

export default () => (
	<div className="logo_qkctsa">
		<img
			alt="logo"
			src={`chrome-extension://${window.reallyreadit.extension.config.extensionId}/content-scripts/ui/images/logo.svg`}
		/>
	</div>
);