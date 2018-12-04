import * as React from 'react';
import InfoBox from '../controls/InfoBox';

export default class extends React.PureComponent<{
	isBrowserCompatible: boolean,
	onInstallExtension: () => void
}> {
	public render() {
		return (
			<InfoBox
				icon="warning"
				position="static"
				style="warning"
			>
				{this.props.isBrowserCompatible ?
					<p>Click <a href="#" onClick={this.props.onInstallExtension}>here</a> to add the Chrome extension.</p> :
					<p>You must use Chrome (on Mac or PC) to track your reading.</p>}
			</InfoBox>
		);
	}
}