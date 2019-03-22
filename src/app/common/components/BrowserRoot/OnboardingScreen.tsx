import * as React from 'react';
import ScreenKey from '../../../../common/routing/ScreenKey';
import routes from '../../../../common/routing/routes';
import { findRouteByKey } from '../../../../common/routing/Route';
import Spinner from './Spinner';
import UserAccount from '../../../../common/models/UserAccount';

interface Props {
	description: string,
	extensionBypass?: React.ReactNode,
	isBrowserCompatible: boolean | null,
	isExtensionInstalled: boolean | null,
	onCopyTextToClipboard: (text: string) => void,
	onInstallExtension: () => void,
	onViewHomeScreen: () => void,
	onShowCreateAccountDialog: () => void,
	onShowSignInDialog: () => void,
	unsupportedBypass: React.ReactNode,
	user: UserAccount |  null
}
export default class OnboardingScreen extends React.Component<Props> {
	private readonly _downloadApp = () => {
		this.props.onCopyTextToClipboard(
			'com.readup.nativeClientClipboardReferrer:' +
			JSON.stringify({
				path: window.location.pathname,
				timestamp: Date.now()
			})
		);
	};
	private readonly _homeScreenUrl = findRouteByKey(routes, ScreenKey.Home).createUrl();
	private readonly _viewHomeScreen = (ev: React.MouseEvent) => {
		ev.preventDefault();
		this.props.onViewHomeScreen();
	};
	public render() {
		return (
			<div className="onboarding-screen_ny0axb">
				<div className="content">
					<div className="logo">
						<a
							href={this._homeScreenUrl}
							onClick={this._viewHomeScreen}
						>
							<img
								alt="logo"
								src="/images/logo.svg"
							/>
						</a>
					</div>
					{this.props.isExtensionInstalled == null || !this.props.description ?
						<Spinner /> :
						<>
							<div className="description">
								<span>Taking you to:</span>
								<strong>
									{this.props.description}
								</strong>
							</div>
							{/(iPhone|iPad)/i.test(window.navigator.userAgent) ?
								<div className="prompt download ios">
									<a
										className="text"
										href="https://itunes.apple.com/us/app/reallyread-it/id1441825432"
										onClick={this._downloadApp}
									>
										Download the app to continue
										<img src="/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg" alt="App Store Badge" />
									</a>
								</div> :
								this.props.user ?
									this.props.isBrowserCompatible ?
										<div className="prompt download chrome">
											<a
												className="text"
												onClick={this.props.onInstallExtension}
											>
												Add the Chrome extension to continue
												<img src="/images/ChromeWebStore_BadgeWBorder.svg" alt="Chrome Web Store Badge" />
											</a>
											{this.props.extensionBypass ?
												<div className="bypass">
													{this.props.extensionBypass}
												</div> :
												null}
										</div> :
										<div className="prompt unsupported">
											<span className="text">Get Readup for iOS and Chrome</span>
											<div className="badges">
												<a href="https://itunes.apple.com/us/app/reallyread-it/id1441825432">
													<img src="/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg" alt="App Store Badge" />
												</a>
												<a onClick={this.props.onInstallExtension}>
													<img src="/images/ChromeWebStore_BadgeWBorder.svg" alt="Chrome Web Store Badge" />
												</a>
											</div>
											{this.props.unsupportedBypass}
										</div> :
									<div className="prompt authenticate">
										<span className="text">Sign up or log in to continue</span>
										<div className="buttons">
											<button
												className="loud"
												onClick={this.props.onShowCreateAccountDialog}
											>
												Sign Up
											</button>
											<button onClick={this.props.onShowSignInDialog}>
												Log In
											</button>
										</div>
									</div>}
						</>}
				</div>
			</div>
		);
	}
}