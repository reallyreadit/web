import * as React from 'react';

export default class extends React.PureComponent<{
	isBrowserCompatible: boolean,
	onInstallExtension: () => void
}> {
	public render() {
		return (
			<div className="read-readiness-bar">
				<div className="content">
					{this.props.isBrowserCompatible ?
						<span>Click <a onClick={this.props.onInstallExtension}>here</a> to add the Chrome extension.</span> :
						<span>You must use Chrome (on Mac or PC) to track your reading.</span>}
				</div>
			</div>
		);
	}
}