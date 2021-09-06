import * as React from 'react';
import { DeviceType, getStoreUrl } from '../../../../common/DeviceType';
import Button, { ButtonSize } from '../../../../common/components/Button';
import RouteLocation from '../../../../common/routing/RouteLocation';
import ScreenKey from '../../../../common/routing/ScreenKey';
import { createUrl } from '../../../../common/HttpEndpoint';
import { deviceTypeQueryStringKey } from '../../../../common/routing/queryString';
import {NavMethod, NavOptions, NavReference} from '../Root';
import Link from '../../../../common/components/Link';

type BaseProps = {
	analyticsAction: string,
	showOtherPlatforms?: boolean,
	size?: ButtonSize,
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean,
	onCopyAppReferrerTextToClipboard?: (analyticsAction: string) => void,
}

type DeviceTypeProps = BaseProps & {
	buttonType: 'platform',
	deviceType: DeviceType,
	onCreateStaticContentUrl: (path: string) => string,
}

// it should be possible to use the DownloadButton without informing it of our current location
// (this is only required when it is desired to open the current page in the app)
type ShowInAppProps = BaseProps & {
	showOpenInApp: true,
	location: RouteLocation,
}

export type Props = BaseProps | DeviceTypeProps | ShowInAppProps;

function isDeviceTypeProps(props: Props): props is DeviceTypeProps {
	return typeof (props as DeviceTypeProps).deviceType === 'string';
}

function isShowInAppProps(props: Props): props is ShowInAppProps {
	return typeof (props as ShowInAppProps).showOpenInApp === 'boolean';
}


export default class DownloadButton extends React.Component<Props> {

	public static defaultProps: Pick<Props, 'showOtherPlatforms' | 'size'> = {
		size: 'x-large',
		showOtherPlatforms: false
	};

	private readonly _copyAppReferrerTextToClipboard = () => {
		this.props.onCopyAppReferrerTextToClipboard(this.props.analyticsAction);
	};

	private _canRenderSpecificPlatform = () => {
		return (isDeviceTypeProps(this.props) && (
			this.props.deviceType === DeviceType.Ios
			// TODO: add Windows button, Linux button, Android button
			));
	}

	private _openInApp = () => {
		if (isShowInAppProps(this.props) && isDeviceTypeProps(this.props) && this.props.showOpenInApp) {
			let targetUrl;
			if (this.props.deviceType === DeviceType.Ios) {
				targetUrl = createUrl(
					{
						host: 'reallyread.it',
						protocol: 'https'
					},
					this.props.location.path,
					{
						[deviceTypeQueryStringKey]: DeviceType.Ios
					}
				)
			} else {
				targetUrl = createUrl(
					{
						host: window.location.host,
						protocol: 'readup'
					},
					this.props.location.path,
				)
			}
			if (targetUrl) {
				window.location.href = targetUrl;
			}
		}
	}

	public componentDidMount = () => {
		// Try an automatic redirect to the app, if:
		// - On desktop? Only if not on Safari Desktop.
		// - Not on iOS. Applinks association only works after a click action & causes an error otherwise (invalid address)
		// - Not on Android. There's no Android app so far.
		if (isShowInAppProps(this.props) && this.props.showOpenInApp
			&& isDeviceTypeProps(this.props)
			&& this.props.deviceType
				&& this.props.deviceType !== DeviceType.DesktopSafari
				&& this.props.deviceType !== DeviceType.Ios
				&& this.props.deviceType !== DeviceType.Android) {
					this._openInApp();
		}
	}

	private _renderGenericButton = () => {
		return <Button
			text="Download App"
			size="large"
			intent="loud"
			onClick={() => this.props.onNavTo({key: ScreenKey.Download}, {method: NavMethod.ReplaceAll})}
		/>
	}
	public render() {
		return (
			<div className="download-button_twjkoi">

				{isDeviceTypeProps(this.props)
					&& this._canRenderSpecificPlatform()
					&& this.props.buttonType === 'platform' ?
						(this.props.deviceType === DeviceType.Ios ?
							<a
								className="ios"
								href={getStoreUrl(DeviceType.Ios)}
								onClick={this.props.onCopyAppReferrerTextToClipboard ? this._copyAppReferrerTextToClipboard : null}
							>
								<img src={this.props.onCreateStaticContentUrl('/app/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg')} alt="App Store Badge" />
							</a> :
						this._renderGenericButton())
					: this._renderGenericButton()
				}
					{ isShowInAppProps(this.props)
						&& this.props.showOpenInApp
						&& isDeviceTypeProps(this.props)
						&& this.props.deviceType !== DeviceType.Android
						?
						<Button
							text="Open in App"
							size='normal'
							intent="normal"
							className="open-in-app"
							onClick={this._openInApp}

						/> : null
					}
					{/* only show the link for other platforms if the download button isn't already generic */}
					{ this.props.showOtherPlatforms && this._canRenderSpecificPlatform() ?
						<div className="platforms">
							<Link screen={ScreenKey.Download} onClick={this.props.onNavTo}>Other platforms</Link>
						</div> : null
					}
			</div>
		);
	}
}