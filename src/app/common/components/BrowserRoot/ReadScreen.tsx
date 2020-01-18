import * as React from 'react';
import { Screen } from '../Root';
import { SharedState } from '../BrowserRoot';
import AsyncTracker from '../../../../common/AsyncTracker';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserArticle from '../../../../common/models/UserArticle';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { findRouteByLocation } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import Fetchable from '../../../../common/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import { formatFetchable, formatList } from '../../../../common/format';
import produce from 'immer';
import { unroutableQueryStringKeys } from '../../../../common/routing/queryString';
import LoadingOverlay from '../controls/LoadingOverlay';
import Button from '../../../../common/components/Button';
import Captcha from '../../Captcha';
import AdFreeAnimation from './AdFreeAnimation';
import ScreenContainer from '../ScreenContainer';

interface Props {
	article: Fetchable<UserArticle>,
	captcha: Captcha,
	isBrowserCompatible: boolean | null,
	isExtensionInstalled: boolean | null,
	isIosDevice: boolean | null,
	marketingVariant: number,
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void,
	onInstallExtension: () => void,
	onOpenCreateAccountDialog: (analyticsAction: string) => void,
	onRegisterExtensionChangeHandler: (handler: (isInstalled: boolean) => void) => Function,
	onRegisterUserChangeHandler: (handler: (user: UserAccount | null) => void) => Function,
	user: UserAccount | null
}
class ReadScreen extends React.PureComponent<Props> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _copyAppReferrerTextToClipboard = () => {
		this.props.onCopyAppReferrerTextToClipboard('ReadScreen');
	};
	private readonly _openCreateAccountDialog = () => {
		this.props.onOpenCreateAccountDialog('ReadScreen');
	};
	constructor(props: Props) {
		super(props);
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterExtensionChangeHandler((isInstalled: boolean) => {
				if (isInstalled && this.props.user) {
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
		if (this.props.article.value) {
			window.location.href = this.props.article.value.url;
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<ScreenContainer className="read-screen_ikr26q">
				{this.props.article.isLoading || this.props.isExtensionInstalled == null ?
					<LoadingOverlay position="absolute" /> :
					<>
						<div className="article">
							{this.props.article.value.source || this.props.article.value.authors.length ?
								<div className="meta">
									{this.props.article.value.authors.length ?
										<span className="authors">
											{formatList(this.props.article.value.authors)}
										</span> :
										null}
									{this.props.article.value.authors.length && this.props.article.value.source ?
										<span> in </span> :
										null}
									{this.props.article.value.source ?
										<span className="source">
											{this.props.article.value.source}
										</span> :
										null}
								</div> :
								null}
							<div className="title">{this.props.article.value.title}</div>
						</div>
						<div className="spacer"></div>
						<AdFreeAnimation />
						<div className="spacer"></div>
						<ul className="animation-caption">
							<li>Leave the noise behind.</li>
							<li>Read it on Readup.</li>
						</ul>
						<div className="spacer"></div>
						{this.props.isIosDevice ?
							<div className="prompt download ios">
								<a
									href="https://itunes.apple.com/us/app/reallyread-it/id1441825432"
									onClick={this._copyAppReferrerTextToClipboard}
								>
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
									</div> :
									<div className="prompt unsupported">
										<span className="text">Get Readup on iOS and Chrome</span>
										<div className="badges">
											<a href="https://itunes.apple.com/us/app/reallyread-it/id1441825432">
												<img src="/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg" alt="App Store Badge" />
											</a>
											<a onClick={this.props.onInstallExtension}>
												<img src="/images/ChromeWebStore_BadgeWBorder.svg" alt="Chrome Web Store Badge" />
											</a>
										</div>
										<div className="bypass">
											<a href={this.props.article.value.url}>Continue to publisher's site</a>
										</div>
									</div> :
								<div className="prompt authenticate">
									<Button
										onClick={this._openCreateAccountDialog}
										text="Read it on Readup"
										intent="loud"
										size="large"
									/>
								</div>}
					</>}
			</ScreenContainer>
		);
	}
}
export default function createReadScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'article' | 'isExtensionInstalled' | 'isIosDevice' | 'user'>> & {
		onGetArticle: FetchFunctionWithParams<{ slug: string }, UserArticle>,
		onSetScreenState: (id: number, getNextState: (currentState: Readonly<Screen<Fetchable<UserArticle>>>) => Partial<Screen<Fetchable<UserArticle>>>) => void
	}
) {
	return {
		create: (id: number, location: RouteLocation) => {
			const
				pathParams = findRouteByLocation(routes, location, unroutableQueryStringKeys).getPathParams(location.path),
				article = deps.onGetArticle(
					{ slug: pathParams['sourceSlug'] + '_' + pathParams['articleSlug'] },
					article => {
						deps.onSetScreenState(id, produce<Screen<Fetchable<UserArticle>>>(currentState => {
							currentState.componentState = article;
							if (article.value) {
								currentState.title = article.value.title;
							} else {
								currentState.title = 'Article not found';
							}
						}));
					}
				);
			return {
				id,
				componentState: article,
				key,
				location,
				title: formatFetchable(article, article => article.title, 'Loading...', 'Article not found.')
			};
		},
		render: (screenState: Screen<Fetchable<UserArticle>>, sharedState: SharedState) => {
			return (
				<ReadScreen {
					...{
						...deps,
						article: screenState.componentState,
						isExtensionInstalled: sharedState.isExtensionInstalled,
						isIosDevice: sharedState.isIosDevice,
						user: sharedState.user
					}
				} />
			);
		}
	};
}