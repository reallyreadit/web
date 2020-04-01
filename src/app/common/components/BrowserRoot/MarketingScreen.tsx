import * as React from 'react';
import Popover, { MenuState, MenuPosition } from '../../../../common/components/Popover';
import ScreenKey from '../../../../common/routing/ScreenKey';
import routes from '../../../../common/routing/routes';
import { findRouteByKey } from '../../../../common/routing/Route';
import AotdView from '../controls/articles/AotdView';
import Fetchable from '../../../../common/Fetchable';
import UserArticle from '../../../../common/models/UserArticle';
import UserAccount from '../../../../common/models/UserAccount';
import ShareData from '../../../../common/sharing/ShareData';
import ShareChannel from '../../../../common/sharing/ShareChannel';
import Rating from '../../../../common/models/Rating';
import LoadingOverlay from '../controls/LoadingOverlay';
import CommunityReads from '../../../../common/models/CommunityReads';
import Panel from './Panel';
import GetStartedButton from './GetStartedButton';
import { variants as marketingVariants } from '../../marketingTesting';
import PageResult from '../../../../common/models/PageResult';
import PublisherArticleQuery from '../../../../common/models/articles/PublisherArticleQuery';
import { FetchFunctionWithParams, FetchFunction } from '../../serverApi/ServerApi';
import AsyncTracker from '../../../../common/AsyncTracker';
import ArticleList from '../controls/articles/ArticleList';
import ArticleDetails from '../../../../common/components/ArticleDetails';
import TrackingAnimation from '../Animations/Tracking/TrackingAnimation';
import { Corporation } from 'schema-dts';
import { JsonLd } from 'react-schemaorg';
import { DeviceType } from '../../../../common/DeviceType';

interface Props {
	communityReads: Fetchable<CommunityReads>,
	deviceType: DeviceType,
	marketingVariant: number,
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetPublisherArticles: FetchFunctionWithParams<PublisherArticleQuery, PageResult<UserArticle>>,
	onGetUserCount: FetchFunction<{ userCount: number }>,
	onOpenNewPlatformNotificationRequestDialog: () => void,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewAotdHistory: () => void,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	user: UserAccount | null
}
export default class MarketingScreen extends React.Component<
	Props,
	{
		blogPosts: Fetchable<PageResult<UserArticle>>,
		menuState: MenuState
	}
> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _copyAppReferrerTextToClipboardFromFooter = () => {
		this.props.onCopyAppReferrerTextToClipboard('HomeScreenFooter');
	};
	private readonly _copyAppReferrerTextToClipboardFromHeader = () => {
		this.props.onCopyAppReferrerTextToClipboard('HomeScreenHeader');
	};
	private readonly _beginClosingMenu = () => {
		this.setState({ menuState: MenuState.Closing });
	};
	private readonly _closeMenu = () => {
		this.setState({ menuState: MenuState.Closed });
	};
	private readonly _openMenu = () => {
		this.setState({ menuState: MenuState.Opened });
	};
	private readonly _profileRoute = findRouteByKey(routes, ScreenKey.Profile);
	private readonly _viewBillsProfile = (event: React.MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		this._beginClosingMenu();
		this.props.onViewProfile('bill');
	};
	private readonly _viewJeffsProfile = (event: React.MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		this._beginClosingMenu();
		this.props.onViewProfile('jeff');
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			blogPosts: props.onGetPublisherArticles(
				{
					pageNumber: 1,
					minLength: null,
					maxLength: null,
					pageSize: 3,
					slug: 'blogreadupcom'
				},
				this._asyncTracker.addCallback(
					blogPosts => {
						this.setState({ blogPosts });
					}
				)
			),
			menuState: MenuState.Closed
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render () {
		const marketingVariant = marketingVariants[this.props.marketingVariant];
		return (
			<div className="marketing-screen_n5a6wc">
				<Panel className="header">
					<h1>{marketingVariant.headline}</h1>
					<h3>{marketingVariant.subtext}</h3>
					<div
						className="buttons"
						data-nosnippet
					>
						<GetStartedButton
							deviceType={this.props.deviceType}
							onCopyAppReferrerTextToClipboard={this._copyAppReferrerTextToClipboardFromHeader}
							onOpenNewPlatformNotificationRequestDialog={this.props.onOpenNewPlatformNotificationRequestDialog}
						/>
					</div>
				</Panel>
				<Panel
					className="how-it-works"
					noGoogleSnippet
				>
					<h2>How Readup works</h2>
					<TrackingAnimation autoPlay />
				</Panel>
				<Panel
					className="aotd"
					noGoogleSnippet
				>
					<h2>What we're reading</h2>
					{this.props.communityReads.isLoading ?
						<LoadingOverlay position="static" /> :
						<AotdView
							aotd={this.props.communityReads.value.aotd}
							articles={this.props.communityReads.value.articles}
							isPaginated={false}
							onCopyTextToClipboard={this.props.onCopyTextToClipboard}
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onPostArticle={this.props.onPostArticle}
							onRateArticle={this.props.onRateArticle}
							onReadArticle={this.props.onReadArticle}
							onShare={this.props.onShare}
							onToggleArticleStar={this.props.onToggleArticleStar}
							onViewAotdHistory={this.props.onViewAotdHistory}
							onViewComments={this.props.onViewComments}
							onViewProfile={this.props.onViewProfile}
							user={this.props.user}
						/>}
				</Panel>
				<Panel
					className="about"
					noGoogleSnippet
				>
					<h2>About</h2>
					<p>Readup is a social reading platform - the best way to find, read, and share articles and stories online. It's powered by a global community of readers and free-thinkers <em>who vote with their attention</em>. No interference. No distractions.</p>
					<p className="bios">
						Readup was invented by two friends, <a href="https://billloundy.com">Bill</a> and <a href="https://jeffcamera.com">Jeff</a>. (We're in the&#32;
						<Popover
							menuChildren={
								<span className="links">
									<a
										href={this.props.onCreateAbsoluteUrl(this._profileRoute.createUrl({ 'userName': 'bill' }))}
										onClick={this._viewBillsProfile}
									>
										readup.com/@bill
									</a>
									<a
										href={this.props.onCreateAbsoluteUrl(this._profileRoute.createUrl({ 'userName': 'jeff' }))}
										onClick={this._viewJeffsProfile}
									>
										readup.com/@jeff
									</a>
								</span>
							}
							menuPosition={MenuPosition.TopCenter}
							menuState={this.state.menuState}
							onBeginClosing={this._beginClosingMenu}
							onClose={this._closeMenu}
							onOpen={this._openMenu}
						>
							comments
						</Popover>
						&#32;every day!) If you have any questions or ideas, don't hesitate to reach out. We love getting emails from the community.
					</p>
					<div
						className="buttons"
						data-nosnippet
					>
						<GetStartedButton
							deviceType={this.props.deviceType}
							onCopyAppReferrerTextToClipboard={this._copyAppReferrerTextToClipboardFromFooter}
							onOpenNewPlatformNotificationRequestDialog={this.props.onOpenNewPlatformNotificationRequestDialog}
						/>
					</div>
				</Panel>
				<Panel
					className="blog"
					noGoogleSnippet
				>
					<h2>From the Readup blog</h2>
					{this.state.blogPosts.isLoading ?
						<LoadingOverlay position="static" /> :
						<ArticleList>
							{this.state.blogPosts.value.items.map(
								article => (
									<li key={article.id}>
										<ArticleDetails
											article={article}
											onCopyTextToClipboard={this.props.onCopyTextToClipboard}
											onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
											onPost={this.props.onPostArticle}
											onRateArticle={this.props.onRateArticle}
											onRead={this.props.onReadArticle}
											onShare={this.props.onShare}
											onToggleStar={this.props.onToggleArticleStar}
											onViewComments={this.props.onViewComments}
											onViewProfile={this.props.onViewProfile}
										/>
									</li>
								)
							)}
						</ArticleList>}
				</Panel>
				<JsonLd<Corporation>
					item={{
						"@context": "https://schema.org",
						"@type": "Corporation",
						"description": "Social media powered by reading.",
						"founders": [
							{
								"@type": "Person",
								"name": "Bill Loundy",
								"url": "https://billloundy.com/"
							},
							{
								"@type": "Person",
								"name": "Jeff Camera",
								"url": "https://jeffcamera.com/"
							}
						],
						"legalName": "reallyread.it, inc.",
						"location": {
							"@type": "Place",
							"address": {
								"@type": "PostalAddress",
								"addressCountry": "USA",
								"addressLocality": "Toms River",
								"addressRegion": "New Jersey"
							}
						},
						"logo": "https://static.readup.com/media/logo-512.png",
						"naics": "519130",
						"name": "Readup",
						"slogan": "The best way to find, read and share articles online.",
						"url": "https://readup.com/"
					}}
				/>
			</div>
		);
	}
}