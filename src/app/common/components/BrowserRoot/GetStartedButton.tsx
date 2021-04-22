import * as React from 'react';
import { DeviceType, getStoreUrl } from '../../../../common/DeviceType';
import Button, { ButtonSize } from '../../../../common/components/Button';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { findRouteByLocation } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import ScreenKey from '../../../../common/routing/ScreenKey';

interface Props {
	analyticsAction: string,
	deviceType: DeviceType,
	iosPromptType?: 'auto' | 'download',
	location: RouteLocation,
	onBeginOnboarding: (analyticsAction: string) => void,
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void,
	onCreateStaticContentUrl: (path: string) => string,
	onOpenNewPlatformNotificationRequestDialog: () => void,
	size?: ButtonSize
}
export default class GetStartedButton extends React.Component<Props> {
	public static defaultProps: Partial<Props> = {
		iosPromptType: 'auto',
		size: 'x-large'
	};
	private readonly _beginOnboarding = () => {
		this.props.onBeginOnboarding(this.props.analyticsAction);
	};
	private readonly _copyAppReferrerTextToClipboard = () => {
		this.props.onCopyAppReferrerTextToClipboard(this.props.analyticsAction);
	};
	public render() {
		const route = findRouteByLocation(routes, this.props.location);
		return (
			<div className="get-started-button_z950ea">
				{this.props.deviceType === DeviceType.Ios ?
					route.screenKey === ScreenKey.Home || this.props.iosPromptType === 'download' ?
						<a
							className="ios"
							href={getStoreUrl(DeviceType.Ios)}
							onClick={this._copyAppReferrerTextToClipboard}
						>
							<img src={this.props.onCreateStaticContentUrl('/app/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg')} alt="App Store Badge" />
						</a> :
						<Button
							text="Open In App"
							size={this.props.size}
							intent="loud"
							href={'https://reallyread.it' + this.props.location.path + '?deviceType=iOS'}
							hrefPreventDefault={false}
						/> :
					this.props.deviceType === DeviceType.Android ?
						<div className="android">
							<div className="coming-soon">Coming soon to Android!</div>
							<Button
								text="Get Notified"
								size={this.props.size}
								intent="loud"
								onClick={this.props.onOpenNewPlatformNotificationRequestDialog}
							/>
							<div className="platforms">
								Readup is currently available on <a href={getStoreUrl(DeviceType.Ios)} target="_blank">iOS</a>, <a href={getStoreUrl(DeviceType.DesktopChrome)} target="_blank">Chrome</a>, <a href={getStoreUrl(DeviceType.DesktopFirefox)} target="_blank">Firefox</a>, <a href={getStoreUrl(DeviceType.DesktopSafari)} target="_blank">Safari</a> and <a href={getStoreUrl(DeviceType.DesktopEdge)} target="_blank">Edge</a>.
							</div>
						</div> :
						<Button
							text="Get Started"
							size={this.props.size}
							intent="loud"
							onClick={this._beginOnboarding}
						/>}
			</div>
		);
	}
}