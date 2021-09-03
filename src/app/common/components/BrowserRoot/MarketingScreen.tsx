import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import ArticleDetails from '../../../../common/components/ArticleDetails';
import { Corporation } from 'schema-dts';
import AsyncTracker from '../../../../common/AsyncTracker';
import { DeviceType } from '../../../../common/DeviceType';
// import Popover, { MenuState, MenuPosition } from '../../../../common/components/Popover';
// import ScreenKey from '../../../../common/routing/ScreenKey';
// import routes from '../../../../common/routing/routes';
// import { findRouteByKey } from '../../../../common/routing/Route';
// import AotdView from '../controls/articles/AotdView';
import Fetchable from '../../../../common/Fetchable';
import PublisherArticleQuery from '../../../../common/models/articles/PublisherArticleQuery';
import LoadingOverlay from '../controls/LoadingOverlay';
import CommunityReads from '../../../../common/models/CommunityReads';
// import { variants as marketingVariants } from '../../marketingTesting';
import PageResult from '../../../../common/models/PageResult';
import Rating from '../../../../common/models/Rating';
import UserAccount from '../../../../common/models/UserAccount';
import UserArticle from '../../../../common/models/UserArticle';
import { ShareEvent } from '../../../../common/sharing/ShareEvent';
import ShareResponse from '../../../../common/sharing/ShareResponse';
import { FetchFunction, FetchFunctionWithParams } from '../../serverApi/ServerApi';
import List from '../controls/List';
import RouteLocation from '../../../../common/routing/RouteLocation';
// import Panel from './Panel';
import HomePanel from './HomePanel';
// import CommunityReadSort from '../../../../common/models/CommunityReadSort';
import ImageAndText from './ImageAndText';
// import Card from './Card';
import QuoteCard from './QuoteCard';
import Button from '../../../../common/components/Button';
import { PriceList } from './MarketingScreen/PriceList';
// import { RevenueMeter } from '../RevenueMeter';
import { RevenueReportResponse } from '../../../../common/models/subscriptions/RevenueReport';
import { NavOptions, NavReference } from '../Root';
// import { HowItWorksVideo, VideoMode } from '../HowItWorksVideo';
import ScreenKey from '../../../../common/routing/ScreenKey';
import {formatCurrency} from '../../../../common/format';
import Link from '../../../../common/components/Link';
import DownloadSection from './MarketingScreen/DownloadSection';
import DownloadButton from './DownloadButton';
import { ShareChannelData } from '../../../../common/sharing/ShareData';
// import classNames from 'classnames';
// import HomeHero from './HomeHero';

interface Props {
	communityReads: Fetchable<CommunityReads>,
	deviceType: DeviceType,
	location: RouteLocation,
	onBeginOnboarding: (analyticsAction: string) => void,
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onCreateStaticContentUrl: (path: string) => string,
	onGetPublisherArticles: FetchFunctionWithParams<PublisherArticleQuery, PageResult<UserArticle>>,
	onGetUserCount: FetchFunction<{ userCount: number }>,
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean,
	onOpenEarningsExplainerDialog: () => void,
	onOpenNewPlatformNotificationRequestDialog: () => void,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShare: (data: ShareEvent) => ShareResponse,
	onShareViaChannel: (data: ShareChannelData) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewAotdHistory: () => void,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	onViewAuthor: (slug: string, name: string) => void,
	onViewMission: () => void,
	revenueReport: Fetchable<RevenueReportResponse>,
	user: UserAccount | null
}
export interface Quote {
	quote: string,
	reader: string,
	articleSlug: string,
	sourceSlug: string,
	commentId: string
}

const prices = [
	{
		amount: formatCurrency(0),
		title: 'Have a look around',
		subtitle: '',
		description: <><p>Browse the articles and comments.</p><p>Ads, paywalls, etc. </p></>
	},
	{
		amount: <>{formatCurrency(499)}<span className="month">/month</span>
			<br/><span className="or-more">Feeling generous?<br/>Pay more! $4.99 is just the minimum.</span>
			</>,
		title: 'Read on Readup',
		subtitle: '',
		// description: <><p>Read on Readup:<br/> no ads, no paywalls</p><p>Watch <strong>95%</strong> of your money go to the writers &amp; publishers you read.</p></>,
		description: <><p>Pure reading bliss.</p><p>No ads. No paywalls. And a really great way to support the writers you read!</p></>,
		selected: true
	},
];

export default class MarketingScreen extends React.Component<
	Props,
	{
		blogPosts: Fetchable<PageResult<UserArticle>>,
		// menuState: MenuState
	}
> {
	private readonly _asyncTracker = new AsyncTracker();
	// private readonly _beginClosingMenu = () => {
	// 	this.setState({ menuState: MenuState.Closing });
	// };
	// private readonly _closeMenu = () => {
	// 	this.setState({ menuState: MenuState.Closed });
	// };
	// private readonly _openMenu = () => {
	// 	this.setState({ menuState: MenuState.Opened });
	// };
	// private readonly _profileRoute = findRouteByKey(routes, ScreenKey.Profile);
	// private readonly _viewBillsProfile = (event: React.MouseEvent<HTMLAnchorElement>) => {
	// 	this.props.onViewProfile('bill');
	// };
	// private readonly _viewJeffsProfile = (event: React.MouseEvent<HTMLAnchorElement>) => {
	// 	event.preventDefault();
	// 	this._beginClosingMenu();
	// 	this.props.onViewProfile('jeff');
	// };
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
			// menuState: MenuState.Closed
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render () {
		// const marketingVariant = marketingVariants[0];
		const valuePoints = [
			{
				heading: "Kill paywalls, kill ads 🔫",
				paragraph: "Get in a reading flow state. Readup removes ads, paywalls and other distractions.",
				imageName: "kill-ads-3.0.png",
				imageAlt: "No paywalls or ads on Readup"
			},
			{
				heading: "The best articles",
				paragraph: "Enjoy articles from top publishers and blogs, curated by Readup's community of deep readers.",
				imageName: "best-articles-3.0.png",
				imageAlt: "The best articles from the web"
			},
			{
				heading: "Import from anywhere, read anywhere.",
				paragraph: "Create your own little library, available on any device. No time to finish an article? Readup bookmarks everything, automatically.",
				imageName: "import-anywhere-3.0.png",
				imageAlt: "Import any where, read on your mobile phone or computer"
			},
			{
				heading: "Better pay for writers ❤️",
				paragraph: <>Readup is completely transparent. <strong>95%</strong> of your subscription fee goes directly to the writers you read. <Link screen={ScreenKey.Leaderboards} onClick={this.props.onNavTo}>Check it out →</Link></>,
				imageName: "watch-money-3.0.png",
				imageAlt: "Readup distributes your money directly to writers"
			}
		];

		const supportPoints = [
			{
				heading: "A vibrant community",
				paragraph: "The Readup community is truly special - thoughtful, kind and interesting. Follow others, enjoy the comments, and feel the love.",
				imageName: "vibrant-community-3.0.png",
				imageAlt: "Import from any publication"
			},
			{
				heading: "Algorithms you can trust",
				paragraph: "There are no echo-chambers on Readup. Everyone sees the same great articles and all algorithms are 100% transparent.",
				imageName: "good-algorithms-3.0.png",
				imageAlt: "Transparent recommendation algorithms"
			},
			{
				heading: "Read-certified comments",
				paragraph: "Readup requires you to read the article if you want to comment on it. This is the key to true civil discourse. ",
				imageName: "civilized-discussion-3.0.png",
				imageAlt: "Readup requires you to read the article if you want to comment on it."
			},
			{
				heading: "Reading statistics",
				paragraph: "Track and improve your reading performance. Read more articles to completion and spend less time skimming and scanning. ",
				imageName: "statistics-3.0.png",
				imageAlt: "Reading statistics"
			},
		]

		/*const howItWorksDesktop = [
			{
				heading: "Step 1: Click the button",
				paragraph: "lalaland",
				imageName: 'click-button.png',
				imageAlt: 'Click the Readup extension button in the right-top of the screen.'
			},
			{
				heading: "Step 2: Enjoy reading",
				paragraph: "lalala",
				imageName: 'read-article.png',
				imageAlt: 'Read the article'
			},
			{
				heading: "Step 3: Discover socially",
				paragraph: "lalala",
				imageName: 'discover-socially.png',
				imageAlt: 'Discover Socially'
			}
		];*/

		const quotes: Quote[] = [
			{
				quote: "My best online reading experiences have happened here.",
				reader: "EZ1969",
				sourceSlug: 'blogreadupcom',
				articleSlug: 'the-readup-manifesto',
				commentId: 'Vy6xgz'
			},
			{
				quote: "I used to have several magazine subscriptions and now I have all of it at Readup. ",
				reader: "Pegeen",
				sourceSlug: 'organizer-sandbox',
				articleSlug: '7-overlooked-signs-youre-living-an-extraordinary-life',
				commentId: 'Vy6Onz'
			},
			{
				quote: "I’m so grateful to have Readup in my life.",
				reader: "KaylaLola",
				sourceSlug: 'blogreadupcom',
				articleSlug: 'the-readup-manifesto',
				commentId: 'V6Qbl5'
			},
			{
				quote: "Readup has fundamentally changed the way I read online.",
				reader: "bartadamley",
				sourceSlug: 'ribbonfarm',
				articleSlug: 'a-text-renaissance',
				commentId: '54vELz'
			},
			{
				quote: "Readup gave me my brain back!",
				reader: "Karenz",
				sourceSlug: 'the-new-york-review-of-books',
				articleSlug: 'how-the-awful-stuff-won',
				commentId: 'VXwN75'
			},
			{
				quote: "Love Readup and love recommending it to my friends and family.",
				reader: "skrt",
				sourceSlug: 'blogreadupcom',
				articleSlug: '2020---the-readup-year-in-review',
				commentId: 'zjy4mV'
			},
			{
				quote: "It’s fascinating to see (and super exciting to be part of) Readup’s growth. Here’s to so much more 🥂❤️✨",
				reader: "chrissetiana",
				sourceSlug: 'washingtonpost',
				articleSlug: 'serious-reading-takes-a-hit-from-online-scanning-and-skimming-researchers-say',
				commentId: 'D9BoO5'
			},
			{
				quote: "I cherish Readup as a safe place for productive and empathic conversation.",
				reader: "thorgalle",
				sourceSlug: 'slack-filescom',
				articleSlug: 'readups-purpose--slack',
				commentId: 'DBvMoD'
			},
			{
				quote: "There is something inherently decent and civil about reading on Readup. It will be an important experiment to see if it can stay a healthy community.",
				reader: "Plum",
				sourceSlug: 'getrevueco',
				articleSlug: '-trump-ban-referred-readups-reluctance-and-taking-down-tiktok',
				commentId: 'DBvX0D'
			},
			{
				quote: "I’m a believer in this project and eager to see what the market will say.",
				reader: "Raven",
				sourceSlug: 'blogreadupcom',
				articleSlug: 'check-out-the-new-readup-homepage',
				commentId: 'zvgpvD'
			}
		];

		return (
			<div className="marketing-screen_n5a6wc">
				<HomePanel className="home-hero-image">
					<div className="home-hero-image__intro-text">
						<h1 className="heading-regular">The world's best reading app.</h1>
						<p>The internet broke reading. We fixed it.</p>
						<DownloadButton
							analyticsAction='home-hero-download'
							buttonType='platform'
							deviceType={this.props.deviceType}
							showOtherPlatforms={true}
							onNavTo={this.props.onNavTo}
							onCopyAppReferrerTextToClipboard={this.props.onCopyAppReferrerTextToClipboard}
							onCreateStaticContentUrl={this.props.onCreateStaticContentUrl}
						/>
					</div>
					<img className="home-hero-image__image" src={this.props.onCreateStaticContentUrl('/app/images/home/readup-hero.png')} alt="A woman and man sit on a bench under a tree.
							The woman enjoys reading a long article on her phone, the man is scrolling through social media feeds."/>
				</HomePanel>
				<HomePanel
					data-nosnippet
				>
					{valuePoints.map((pointData, i) =>
					<ImageAndText
						{...pointData}
						key={pointData.imageName}
						onCreateStaticContentUrl={this.props.onCreateStaticContentUrl}
						imageRight={!(i % 2 == 0)}
						type="contained" />) }
				</HomePanel>
				{/* <HomePanel
					data-nosnippet
				>
					<h2 className="heading-regular">We're on a quest to save journalism.</h2>
					<div className="flex-panel">
						{[1,2,3].map(n => <Card key={n}>Test</Card>)}
					</div>
				</HomePanel> */}
				{/*<HomePanel id='how-it-works'>
					<h2 className="heading-regular">How it works</h2>
					<div className="how-it-works__selector">
						{[{value: 'Desktop'}, {value: 'iOS'}].map(
							(item, i) => (
								<button
									className={classNames({ 'selected': i % 2 == 0 })}
									disabled={false}
									key={item.value}
									// onClick={this._change}
									onClick={() => {}}
									value={item.value}
								>
									{item.value}*/}
									{/* <AlertBadge count={item.badge} /> */}
								{/*</button>*/}
							{/*)
						)}
					</div>*/}
					{/* <div> */}
						{/*{howItWorksDesktop.map(props =>
							<ImageAndText
								{...props}
								key={props.heading}
								onCreateStaticContentUrl={this.props.onCreateStaticContentUrl}
								type='wide'
							/>
						)}*/}
					{/* </div> */}

				{/*</HomePanel>*/}
				<HomePanel
					data-nosnippet
					className="pricing-panel"
				>
					<h2 className="heading-regular">Pick your price</h2>
					<PriceList prices={prices} />
					<DownloadSection
						onNavTo={this.props.onNavTo}
						onCopyAppReferrerTextToClipboard={this.props.onCopyAppReferrerTextToClipboard}
					/>

				</HomePanel>
				{/* {this.props.revenueReport.value?.report.totalRevenue > 0 ?
					<HomePanel
						data-nosnippet
						className="revenue-panel"
					>
						<RevenueMeter
							onOpenEarningsExplainerDialog={this.props.onOpenEarningsExplainerDialog}
							report={this.props.revenueReport}
						/>
					</HomePanel> :
					null} */}
				{/* <HomePanel
					data-nosnippet
					className="how-it-works"
				>
					<h2 className="heading-regular">How it works</h2>
					<p className="home-section-intro">Watch our CEO give a 3-minute demo of Readup.</p>
					<HowItWorksVideo mode={VideoMode.Embed} />
				</HomePanel> */}
				<HomePanel
					data-nosnippet
					className="quote-panel"
				>
					<h2 className="heading-regular">What our readers say</h2>
					<p className="home-section-intro">We're proud to improve the lives of our readers on a daily basis.<br/>
						{/* Check out these spontaneous testimonials from real humans beings. */}
						</p>
					<div className="quote-grid">
						{quotes.map(quote =>
							<QuoteCard
								key={quote.quote}
								onNavTo={this.props.onNavTo}
								quote={quote} />
						)}
					</div>
				</HomePanel>
				<HomePanel
					data-nosnippet
				>
					<h2 className="heading-regular">And there's more!</h2>
					{supportPoints.map((pointData, i) =>
						<ImageAndText
							{...pointData}
							key={pointData.imageName}
							onCreateStaticContentUrl={this.props.onCreateStaticContentUrl}
							imageRight={!(i % 2 == 0)}
							type="contained" />) }
					<DownloadSection
						onNavTo={this.props.onNavTo}
						onCopyAppReferrerTextToClipboard={this.props.onCopyAppReferrerTextToClipboard}
					/>
				</HomePanel>
				<HomePanel
					data-nosnippet
					className="closing-quote-panel"
				>
					{/* <span className="preheading">Remember</span> */}
					<cite className="closing-quote"><p>We're on a mission to fix digital reading.</p></cite>
					<Button
						className="mission-button"
						iconRight="chevron-right"
						intent="normal"
						onClick={this.props.onViewMission}
						style="normal"
						text="Learn more about our mission &amp; story"
						/>
				</HomePanel>
				<HomePanel
					className="blog"
					noGoogleSnippet
				>
					<h2 className="heading-regular">From the blog</h2>
					<p className="home-section-intro">Read about how Readup is changing the future of digital reading. Add your thoughts in the comments.</p>
					{this.state.blogPosts.isLoading ?
						<LoadingOverlay position="static" /> :
						<List>
							{this.state.blogPosts.value.items.map(
								article => (
									<li key={article.id}>
										<ArticleDetails
											article={article}
											deviceType={this.props.deviceType}
											onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
											onNavTo={this.props.onNavTo}
											onPost={this.props.onPostArticle}
											onRateArticle={this.props.onRateArticle}
											onRead={this.props.onReadArticle}
											onShare={this.props.onShare}
											onShareViaChannel={this.props.onShareViaChannel}
											onToggleStar={this.props.onToggleArticleStar}
											onViewComments={this.props.onViewComments}
											onViewProfile={this.props.onViewProfile}
										/>
									</li>
								)
							)}
						</List>}
						<div className="controls">
							<Button
							iconRight="chevron-right"
							intent="normal"
							onClick={() => {
								window.location.href = 'https://blog.readup.com'
							}}
							style="preferred"
							text="See more articles"
							/>
						</div>
				</HomePanel>
				{/* <Panel className="header">
					<h1>{marketingVariant.headline}</h1>
					<h3>{marketingVariant.subtext}</h3>
					<div
						className="buttons"
						data-nosnippet
					>
						<GetStartedButton
							analyticsAction="HomeScreenHeader"
							deviceType={this.props.deviceType}
							location={this.props.location}
							onBeginOnboarding={this.props.onBeginOnboarding}
							onCopyAppReferrerTextToClipboard={this.props.onCopyAppReferrerTextToClipboard}
							onCreateStaticContentUrl={this.props.onCreateStaticContentUrl}
							onOpenNewPlatformNotificationRequestDialog={this.props.onOpenNewPlatformNotificationRequestDialog}
						/>
					</div>
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
							isLoading={false}
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
							sort={CommunityReadSort.Hot}
						/>}
				</Panel>
				<Panel
					className="about"
					noGoogleSnippet
				>
					<h2>About</h2>
					<p>Readup is a social reading platform - the best way to find, read, and share articles and stories online. It's powered by a global community of readers and free-thinkers who <em>vote with their attention</em>. Articles are ranked by number of completed reads, instead of likes or upvotes. And there are absolutely no ads or distractions anywhere.</p>
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
							analyticsAction="HomeScreenFooter"
							deviceType={this.props.deviceType}
							location={this.props.location}
							onBeginOnboarding={this.props.onBeginOnboarding}
							onCopyAppReferrerTextToClipboard={this.props.onCopyAppReferrerTextToClipboard}
							onCreateStaticContentUrl={this.props.onCreateStaticContentUrl}
							onOpenNewPlatformNotificationRequestDialog={this.props.onOpenNewPlatformNotificationRequestDialog}
						/>
					</div>
				</Panel>
						*/}
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