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
import ShareData from '../../../../common/sharing/ShareData';
import ShareResponse from '../../../../common/sharing/ShareResponse';
import { FetchFunction, FetchFunctionWithParams } from '../../serverApi/ServerApi';
import ArticleList from '../controls/articles/ArticleList';
// import Panel from './Panel';
import GetStartedButton from './GetStartedButton';
import HomePanel from './HomePanel';
// import CommunityReadSort from '../../../../common/models/CommunityReadSort';
import ImageAndText from './ImageAndText';
// import Card from './Card';
import QuoteCard from './QuoteCard';
import Button from '../../../../common/components/Button';
// import HomeHero from './HomeHero';

interface Props {
	communityReads: Fetchable<CommunityReads>,
	deviceType: DeviceType,
	onBeginOnboarding: (analyticsAction: string) => void,
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetPublisherArticles: FetchFunctionWithParams<PublisherArticleQuery, PageResult<UserArticle>>,
	onGetUserCount: FetchFunction<{ userCount: number }>,
	onOpenNewPlatformNotificationRequestDialog: () => void,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShare: (data: ShareData) => ShareResponse,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewAotdHistory: () => void,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	onViewAuthor: (slug: string, name: string) => void,
	user: UserAccount | null
}
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
	// 	event.preventDefault();
	// 	this._beginClosingMenu();
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
				heading: "Read anything you want.",
				paragraph: "Easily import articles from your favorite publishers and blogs. Or browse Readup's collection of top-quality articles.",
				imageName: "read-anything.png",
				imageAlt: "Import from any publication"
			},
			{
				heading: "Reading perfected.",
				paragraph: "Readup's iPhone app and browser extensions offer immersive, 100% distraction-free reading. No time to finish? Readup bookmarks everything, automatically. ",
				imageName: "reading-perfected.png",
				imageAlt: "Reading view without clutter or distractions"
			},
			{
				heading: "Algorithms you can trust",
				paragraph: "Readup doesn't have liking or upvoting. Instead, Readers \"vote\" with their time and attention. All algorithms are 100% transparent and Reader-powered. (No mods!) ",
				imageName: "good-algorithms.png",
				imageAlt: "Transparent recommendation mechanism"
			},
			{
				heading: "Civil discourse. Finally.",
				paragraph: "On Readup, it's impossible for anybody to comment on any article that they haven't fully read. Readup is troll-free, non-toxic, and non-addictive.",
				imageName: "civil-discourse.png",
				imageAlt: "You must read the article before you can post or reply."
			},
		];

		const quotes = [
			{
				quote: "There is something inherently decent and civil about reading on Readup. It will be an important experiment to see if it can stay a healthy community.",
				reader: "Plum",
				source: "https://readup.com/comments/getrevueco/-trump-ban-referred-readups-reluctance-and-taking-down-tiktok/DBvX0D"
			},
			{
				quote: "My best online reading experiences have happened here.",
				reader: "EZ1969",
				source: "https://readup.com/comments/blogreadupcom/the-readup-manifesto/Vy6xgz"
			},
			{
				quote: "I’m so grateful to have Readup in my life.",
				reader: "KaylaLola",
				source: "https://readup.com/comments/blogreadupcom/the-readup-manifesto/V6Qbl5"
			},
			{
				quote: "Readup gave me my brain back!",
				reader: "Karenz",
				source: "https://readup.com/comments/the-new-york-review-of-books/how-the-awful-stuff-won/VXwN75"
			},
			{
				quote: "It’s fascinating to see (and super exciting to be part of) Readup’s growth. Here’s to so much more 🥂❤️✨",
				reader: "chrissetiana",
				source: "https://readup.com/comments/washingtonpost/serious-reading-takes-a-hit-from-online-scanning-and-skimming-researchers-say/D9BoO5"
			},
			{
				quote: "I cherish Readup as a safe place for productive and empathic conversation.",
				reader: "thorgalle",
				source: "https://readup.com/comments/slack-filescom/readups-purpose--slack/DBvMoD"
			},
			{
				quote: "Readup has fundamentally changed the way I read online.",
				reader: "bartadamley",
				source: "https://readup.com/comments/ribbonfarm/a-text-renaissance/54vELz",
			},
			{
				quote: "I used to have several magazine subscriptions and now I have all of it at Readup. ",
				reader: "Pegeen",
				source: "https://readup.com/comments/organizer-sandbox/7-overlooked-signs-youre-living-an-extraordinary-life/Vy6Onz"
			},
			{
				quote: "I’m a believer in this project and eager to see what the market will say.",
				reader: "Raven",
				source: "https://readup.com/comments/blogreadupcom/check-out-the-new-readup-homepage/zvgpvD"
			},
			{
				quote: "Love Readup and love recommending it to my friends and family.",
				reader: "skrt",
				source: "https://readup.com/comments/blogreadupcom/2020---the-readup-year-in-review/zjy4mV"
			}
		];

		return (
			<div className="marketing-screen_n5a6wc">
				<HomePanel className="home-hero-image">
					<div className="home-hero-image__intro-text">
						<h1 className="heading-regular">The internet broke reading.<br />We fixed it.</h1>
						<p>Readup is a social reading network for articles.<br/>We help you find, read and share the best articles online.</p>
						<GetStartedButton
							analyticsAction="HomeScreenHeader"
							deviceType={this.props.deviceType}
							onBeginOnboarding={this.props.onBeginOnboarding}
							onCopyAppReferrerTextToClipboard={this.props.onCopyAppReferrerTextToClipboard}
							onOpenNewPlatformNotificationRequestDialog={this.props.onOpenNewPlatformNotificationRequestDialog}
						/>
					</div>
					<img className="home-hero-image__image" src="/images/readup-hero.png" alt="A woman and man sit on a bench under a tree.
							The woman enjoys reading a long article on her phone, the man is scrolling through social media feeds."/>
				</HomePanel>
				{/* <HomeHero
					title={<>The internet broke reading.<br />We fixed it.</>}
					description={<>Readup makes online reading more peaceful and focused.</>}
					actionButton={

					}
				/> */}
				<HomePanel
					data-nosnippet
				>
					{valuePoints.map((pointData, i) => <ImageAndText key={pointData.imageName} {...pointData} imageRight={!(i % 2 == 0)} />) }
				</HomePanel>
				{/* <HomePanel
					data-nosnippet
				>
					<h2 className="heading-regular">We're on a quest to save journalism.</h2>
					<div className="flex-panel">
						{[1,2,3].map(n => <Card key={n}>Test</Card>)}
					</div>
				</HomePanel> */}
				<HomePanel
					data-nosnippet
					className="quote-panel"
				>
					<h2 className="heading-regular">What our Readers say</h2>
					<p className="home-section-intro">We're proud to improve the lives of our Readers on a daily basis.<br/>
						Consider these spontaneous testimonials from real humans!</p>
					<div className="quote-grid">
						{quotes.map(quote =>
						<QuoteCard
							key={quote.quote}
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onViewProfile={this.props.onViewProfile}
							{...quote} />
						)}
					</div>
				</HomePanel>
				<HomePanel
					className="blog"
					noGoogleSnippet
				>
					<h2 className="heading-regular">From the blog</h2>
					<p className="home-section-intro">Learn more about how Readup is changing the future of digital reading. Add your thoughts and ideas in the comments.</p>
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
						<div className="controls">
							<Button
							iconRight="chevron-right"
							intent="normal"
							onClick={() => {
								// TODO: this doesn't work
								this.props.onViewAuthor('bill-loundy', 'Bill Loundy');
								// window.location.href = 'https://blog.readup.com'
							}}
							style="preferred"
							text="See more articles"
							/>
						</div>
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
						onClick={() => {
							// TODO: make an internal link
							window.location.href = '/mission'
						}}
						style="normal"
						text="Learn more about our mission &amp; story"
						/>
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
							onBeginOnboarding={this.props.onBeginOnboarding}
							onCopyAppReferrerTextToClipboard={this.props.onCopyAppReferrerTextToClipboard}
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
							onBeginOnboarding={this.props.onBeginOnboarding}
							onCopyAppReferrerTextToClipboard={this.props.onCopyAppReferrerTextToClipboard}
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