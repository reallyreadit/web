import * as React from 'react';
import { Screen } from '../Root';
import { SharedState } from '../BrowserRoot';
import AsyncTracker from '../../../../common/AsyncTracker';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserArticle from '../../../../common/models/UserArticle';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import ScreenKey from '../../../../common/routing/ScreenKey';
import logoText from '../../../../common/svg/logoText';
import Fetchable from '../../serverApi/Fetchable';
import Spinner from './ReadScreen/Spinner';
import UserAccount from '../../../../common/models/UserAccount';

interface Props {
	isBrowserCompatible: boolean | null,
	isExtensionInstalled: boolean | null,
	isUserSignedIn: boolean,
	onGetArticle: FetchFunctionWithParams<{ slug: string }, UserArticle>
	onInstallExtension: () => void,
	onRegisterExtensionChangeHandler: (handler: (isInstalled: boolean) => void) => Function,
	onRegisterUserChangeHandler: (handler: (user: UserAccount | null) => void) => Function,
	onShowCreateAccountDialog: () => void,
	onShowSignInDialog: () => void,
	onViewHomeScreen: () => void,
	location: RouteLocation
}
class ReadScreen extends React.PureComponent<Props, { article: Fetchable<UserArticle> }> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _homeScreenUrl = findRouteByKey(routes, ScreenKey.Home).createUrl();
	private readonly _viewHomeScreen = (ev: React.MouseEvent) => {
		ev.preventDefault();
		this.props.onViewHomeScreen();
	};
	constructor(props: Props) {
		super(props);
		const pathParams = findRouteByKey(routes, ScreenKey.Read).getPathParams(props.location.path);
		this.state = {
			article: props.onGetArticle(
				{ slug: pathParams['sourceSlug'] + '_' + pathParams['articleSlug'] },
				article => {
					this.setState({ article });
				}
			)
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterExtensionChangeHandler((isInstalled: boolean) => {
				if (isInstalled && this.props.isUserSignedIn) {
					this.navigateToArticle();
				}
			}),
			props.onRegisterUserChangeHandler((user: UserAccount | null) => {
				if (user && this.props.isExtensionInstalled) {
					this.navigateToArticle();
				}
			})
		);
	}
	private navigateToArticle() {
		window.location.href = this.state.article.value.url;
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		let articleTitle: string | undefined;
		let articleUrl: string | undefined;
		if (this.state.article.value) {
			articleTitle = this.state.article.value.title;
			articleUrl = this.state.article.value.url;
		}
		return (
			<div className="read-screen_ikr26q">
				<div className="content">
					<div className="logo">
						<a
							dangerouslySetInnerHTML={{ __html: logoText }}
							href={this._homeScreenUrl}
							onClick={this._viewHomeScreen}
						></a>
					</div>
					{(
						this.props.isExtensionInstalled == null ||
						(this.props.isExtensionInstalled && this.props.isUserSignedIn)
					) ?
						<Spinner /> :
						<>
							<div className="article">
								<span>Taking you to:</span>
								<strong>
									{articleTitle}
								</strong>
							</div>
							{/(iPhone|iPad)/i.test(window.navigator.userAgent) ?
								<a
									className="download ios"
									href="https://itunes.apple.com/us/app/reallyread-it/id1441825432"
								>
									Download the app to continue
									<img src="/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg" alt="App Store Badge" />
								</a> :
								this.props.isUserSignedIn ?
									this.props.isBrowserCompatible ?
										<a
											className="download chrome"
											onClick={this.props.onInstallExtension}
										>
											Add the Chrome extension to continue
											<img src="/images/ChromeWebStore_BadgeWBorder.svg" alt="Chrome Web Store Badge" />
										</a> :
										<div className="unsupported">
											Get reallyread.it for iOS and Chrome
											<div className="badges">
												<a href="https://itunes.apple.com/us/app/reallyread-it/id1441825432">
													<img src="/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg" alt="App Store Badge" />
												</a>
												<a onClick={this.props.onInstallExtension}>
													<img src="/images/ChromeWebStore_BadgeWBorder.svg" alt="Chrome Web Store Badge" />
												</a>
											</div>
											<a href={articleUrl}>Continue to publisher's site</a>
										</div> :
									<div className="authenticate">
										Sign up or log in to continue
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
export default function createReadScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'location' | 'isExtensionInstalled' | 'isUserSignedIn'>>
) {
	return {
		create: (location: RouteLocation) => ({ key, location, title: 'Read Article' }),
		render: (screenState: Screen, sharedState: SharedState) => (
			<ReadScreen {
				...{
					...deps,
					location: screenState.location,
					isExtensionInstalled: sharedState.isExtensionInstalled,
					isUserSignedIn: !!sharedState.user
				}
			} />
		)
	};
}