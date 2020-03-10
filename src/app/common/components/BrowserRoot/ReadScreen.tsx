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
import AdFreeAnimation from './AdFreeAnimation';
import ScreenContainer from '../ScreenContainer';
import { DeviceType } from '../../DeviceType';
import GetStartedButton from './GetStartedButton';

interface Props {
	article: Fetchable<UserArticle>,
	deviceType: DeviceType,
	isExtensionInstalled: boolean,
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void,
	onOpenNewPlatformNotificationRequestDialog: () => void,
	onRegisterExtensionChangeHandler: (handler: (isInstalled: boolean) => void) => Function,
	onRegisterUserChangeHandler: (handler: (user: UserAccount | null) => void) => Function,
	user: UserAccount | null
}
class ReadScreen extends React.PureComponent<Props> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _copyAppReferrerTextToClipboard = () => {
		this.props.onCopyAppReferrerTextToClipboard('ReadScreen');
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
	public componentDidMount() {
		if (this.props.user && this.props.isExtensionInstalled) {
			this.navigateToArticle();
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<ScreenContainer className="read-screen_ikr26q">
				{this.props.article.isLoading ?
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
						<GetStartedButton
							deviceType={this.props.deviceType}
							onCopyAppReferrerTextToClipboard={this._copyAppReferrerTextToClipboard}
							onOpenNewPlatformNotificationRequestDialog={this.props.onOpenNewPlatformNotificationRequestDialog}
						/>
						{this.props.deviceType !== DeviceType.Ios && this.props.deviceType !== DeviceType.DesktopChrome ?
							<div className="bypass">
								<a href={this.props.article.value.url}>Continue to publisher's site</a>
							</div> :
							null}
					</>}
			</ScreenContainer>
		);
	}
}
export default function createReadScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'article' | 'isExtensionInstalled' | 'user'>> & {
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
						deps.onSetScreenState(id, produce((currentState: Screen<Fetchable<UserArticle>>) => {
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
						user: sharedState.user
					}
				} />
			);
		}
	};
}