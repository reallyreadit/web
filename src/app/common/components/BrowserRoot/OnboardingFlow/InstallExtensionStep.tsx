import * as React from 'react';
import { DeviceType, isCompatibleBrowser, getExtensionName, getStoreUrl } from '../../../../../common/DeviceType';
import Button from '../../../../../common/components/Button';
import * as Cookies from 'js-cookie';
import { extensionInstallationRedirectPathCookieKey } from '../../../../../common/cookies';

interface Props {
	deviceType: DeviceType
}
export default class InstallExtensionStep extends React.PureComponent<Props> {
	private readonly _addExtension = (event: React.MouseEvent) => {
		if (window.location.pathname !== '/') {
			Cookies.set(
				extensionInstallationRedirectPathCookieKey,
				window.location.pathname,
				{
					expires: new Date(Date.now() + (15 * 60 * 1000))
				}
			);
		}
		window.open((event.currentTarget as HTMLAnchorElement).href);
	};
	public render() {
		return (
			<div className="install-extension-step_gudkmn">
				{isCompatibleBrowser(this.props.deviceType) ?
					<>
						<h1>To read on Readup, add the {this.props.deviceType} {getExtensionName(this.props.deviceType)}.</h1>
						<Button
							href={getStoreUrl(this.props.deviceType)}
							intent="loud"
							onClick={this._addExtension}
							size="large"
							text={`Add to ${this.props.deviceType} — It's Free`}
						/>
					</> :
					<>
						<h2>Readup isn't available yet for {this.props.deviceType}.</h2>
						<h2>Readup is currently available on <a href={getStoreUrl(DeviceType.Ios)} target="_blank">iOS</a>, <a href={getStoreUrl(DeviceType.DesktopChrome)} target="_blank">Chrome</a> and <a href={getStoreUrl(DeviceType.DesktopFirefox)} target="_blank">Firefox</a>.</h2>
					</>}
			</div>
		);
	}
}