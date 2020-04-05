import * as React from 'react';
import { DeviceType, getStoreUrl } from '../../../../common/DeviceType';
import Button from '../../../../common/components/Button';

export default class GetStartedButton extends React.PureComponent<{
	analyticsAction: string,
	deviceType: DeviceType,
	onBeginOnboarding: (analyticsAction: string) => void,
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void,
	onOpenNewPlatformNotificationRequestDialog: () => void
}> {
	private readonly _beginOnboarding = () => {
		this.props.onBeginOnboarding(this.props.analyticsAction);
	};
	private readonly _copyAppReferrerTextToClipboard = () => {
		this.props.onCopyAppReferrerTextToClipboard(this.props.analyticsAction);
	};
	public render() {
		return (
			<div className="get-started-button_z950ea">
				{this.props.deviceType === DeviceType.Ios ?
					<a
						className="ios"
						href={getStoreUrl(DeviceType.Ios)}
						onClick={this._copyAppReferrerTextToClipboard}
					>
						<img src="/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg" alt="App Store Badge" />
					</a> :
					this.props.deviceType === DeviceType.Android ?
						<div className="android">
							<div className="coming-soon">Coming soon to Android!</div>
							<Button
								text="Get Notified"
								size="x-large"
								intent="loud"
								onClick={this.props.onOpenNewPlatformNotificationRequestDialog}
							/>
							<div className="platforms">
								Readup is currently available on <a href={getStoreUrl(DeviceType.Ios)} target="_blank">iOS</a>, <a href={getStoreUrl(DeviceType.DesktopChrome)} target="_blank">Chrome</a> and <a href={getStoreUrl(DeviceType.DesktopFirefox)} target="_blank">Firefox</a>.
							</div>
						</div> :
						<Button
							text="Get Started"
							size="x-large"
							intent="loud"
							onClick={this._beginOnboarding}
						/>}
			</div>
		);
	}
}