import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import { Corporation } from 'schema-dts';
import AsyncTracker from '../../../../common/AsyncTracker';
import { DeviceType } from '../../../../common/DeviceType';
import Fetchable from '../../../../common/Fetchable';
import PublisherArticleQuery from '../../../../common/models/articles/PublisherArticleQuery';
import CommunityReads from '../../../../common/models/CommunityReads';
import PageResult from '../../../../common/models/PageResult';
import Rating from '../../../../common/models/Rating';
import UserAccount from '../../../../common/models/UserAccount';
import UserArticle from '../../../../common/models/UserArticle';
import { ShareEvent } from '../../../../common/sharing/ShareEvent';
import ShareResponse from '../../../../common/sharing/ShareResponse';
import { FetchFunction, FetchFunctionWithParams } from '../../serverApi/ServerApi';
import RouteLocation from '../../../../common/routing/RouteLocation';
import HomePanel from './HomePanel';
import ImageAndText from './ImageAndText';
import QuoteCard from './QuoteCard';
import { NavOptions, NavReference } from '../Root';
// import Link from '../../../../common/components/Link';
import DownloadSection from './MarketingScreen/DownloadSection';
import DownloadButton from './DownloadButton';
import { ShareChannelData } from '../../../../common/sharing/ShareData';
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
	onOpenNewPlatformNotificationRequestDialog: () => void,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLElement>) => void,
	onShare: (data: ShareEvent) => ShareResponse,
	onShareViaChannel: (data: ShareChannelData) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewAotdHistory: () => void,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	onViewAuthor: (slug: string, name: string) => void,
	user: UserAccount | null
}
export interface Quote {
	quote: string,
	reader: string,
	articleSlug: string,
	sourceSlug: string,
	commentId: string
}

export default class MarketingScreen extends React.Component<
	Props,
	{
		blogPosts: Fetchable<PageResult<UserArticle>>,
		// menuState: MenuState
	}
> {
	private readonly _asyncTracker = new AsyncTracker();
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
		const valuePoints = [
			{
				heading: "Made for readers, by readers",
				paragraph: "Readup was built by people love deep reading. The app removes distractions from articles.",
				imageName: "kill-ads-3.0.png",
				imageAlt: "No paywalls or ads on Readup"
			},
			{
				heading: "A vibrant community",
				paragraph: "Not sure what to read? The Readup community curates the best of the best from across the web.",
				imageName: "best-articles-3.0.png",
				imageAlt: "The best articles from the web"
			},
			{
				heading: "Algorithms you can trust",
				paragraph: "There are no filter-bubble algorithms behind Readup. Readup is open, and everyone sees the same great articles.",
				imageName: "good-algorithms-3.0.png",
				imageAlt: "Transparent recommendation algorithms"
			},
			// {
			// 	heading: "A vibrant community",
			// 	paragraph: "The Readup community is truly special - thoughtful, kind and interesting. Follow others, enjoy the comments, and feel the love.",
			// 	imageName: "vibrant-community-3.0.png",
			// 	imageAlt: "Save from any publication"
			// },
			{
				heading: "Read-certified comments",
				paragraph: "Readup requires you to read the article if you want to comment on it. This is the key to true civil discourse.",
				imageName: "civilized-discussion-3.0.png",
				imageAlt: "Readup requires you to read the article if you want to comment on it."
			},
		];

		// const supportPoints = [
		// 	{
		// 		heading: "Save for later",
		// 		paragraph: "Create your own little reading list, available on any device. No time to finish an article? Readup bookmarks everything, automatically.",
		// 		imageName: "import-anywhere-3.0.png",
		// 		imageAlt: "Save any where, read on your mobile phone or computer"
		// 	},
		// 	{
		// 		heading: "Reading statistics",
		// 		paragraph: "Track and improve your reading performance. Read more articles to completion and spend less time skimming and scanning. ",
		// 		imageName: "statistics-3.0.png",
		// 		imageAlt: "Reading statistics"
		// 	},
		// ]

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
						<h1 className="heading-regular">Online reading is broken.<br/>We're fixing it.</h1>
						<p>Readup is a free &amp; open-source reading app.<br/>Join our community today!</p>
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
				<HomePanel
					data-nosnippet
					className="pricing-panel"
				>
					<h2 className="heading-regular">Get Readup</h2>
					<DownloadSection
						onNavTo={this.props.onNavTo}
						onCopyAppReferrerTextToClipboard={this.props.onCopyAppReferrerTextToClipboard}
					/>

				</HomePanel>
				<HomePanel
					data-nosnippet
					className="quote-panel"
				>
					<h2 className="heading-regular">What our readers say</h2>
					<p className="home-section-intro">We're proud to improve the lives of internet readers on a daily basis.<br/>
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