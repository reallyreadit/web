import * as React from 'react';
import InfoBox from '../controls/InfoBox';

export default class extends React.PureComponent<{
	onInstallExtension: () => void
}> {
	public render() {
		return (
			<InfoBox
				className="read-readiness-info-box_gbdufn"
				position="static"
				style="normal"
			>
				<a onClick={this.props.onInstallExtension}>
					Add the browser extension to get started.
					<img src="/images/ChromeWebStore_BadgeWBorder.svg" alt="Chrome Web Store Badge" />
				</a>
			</InfoBox>
		);
	}
}