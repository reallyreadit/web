// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import { Corporation } from 'schema-dts';
import AsyncTracker from '../../../../common/AsyncTracker';
import Fetchable from '../../../../common/Fetchable';
import PublisherArticleQuery from '../../../../common/models/articles/PublisherArticleQuery';
import PageResult from '../../../../common/models/PageResult';
import UserArticle from '../../../../common/models/UserArticle';
import {
	FetchFunctionWithParams,
} from '../../serverApi/ServerApi';
import HomePanel from '../HomePanel';
import ImageAndText from './MarketingScreen/ImageAndText';
import QuoteCard from './MarketingScreen/QuoteCard';
import { NavOptions, NavReference } from '../Root';
import Link from '../../../../common/components/Link';
import Icon from '../../../../common/components/Icon';
import RouteLocation from '../../../../common/routing/RouteLocation';
interface Props {
	onCreateStaticContentUrl: (path: string) => string;
	onGetPublisherArticles: FetchFunctionWithParams<
		PublisherArticleQuery,
		PageResult<UserArticle>
	>;
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean;
}
export interface Quote {
	quote: string;
	reader: string;
	articleSlug: string;
	sourceSlug: string;
	commentId: string;
}

class MarketingScreen extends React.Component<
	Props,
	{
		blogPosts: Fetchable<PageResult<UserArticle>>;
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
					slug: 'blogreadupcom',
				},
				this._asyncTracker.addCallback((blogPosts) => {
					this.setState({ blogPosts });
				})
			),
			// menuState: MenuState.Closed
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		const valuePoints = [
			{
				heading: 'Made for readers, by readers',
				paragraph:
					'Readup is built by people who love deep reading. Our apps and browser extensions remove distractions from articles.',
				imageName: 'kill-ads-3.0.png',
				imageAlt: 'No paywalls or ads on Readup',
			},
			{
				heading: 'A vibrant community',
				paragraph:
					'Not sure what to read? The Readup community curates the best of the best from across the web.',
				imageName: 'best-articles-3.0.png',
				imageAlt: 'The best articles from the web',
			},
			{
				heading: 'Algorithms you can trust',
				paragraph:
					'There are no filter-bubble algorithms behind Readup. Readup is open, and everyone sees the same great articles.',
				imageName: 'good-algorithms-3.0.png',
				imageAlt: 'Transparent recommendation algorithms',
			},
			// {
			// 	heading: "A vibrant community",
			// 	paragraph: "The Readup community is truly special - thoughtful, kind and interesting. Follow others, enjoy the comments, and feel the love.",
			// 	imageName: "vibrant-community-3.0.png",
			// 	imageAlt: "Save from any publication"
			// },
			{
				heading: 'Read-certified comments',
				paragraph:
					'Readup requires you to read an article before commenting on it. This is key to true civil discourse.',
				imageName: 'civilized-discussion-3.0.png',
				imageAlt:
					'Readup requires you to read the article if you want to comment on it.',
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
				quote: 'My best online reading experiences have happened here.',
				reader: 'EZ1969',
				sourceSlug: 'blogreadupcom',
				articleSlug: 'the-readup-manifesto',
				commentId: 'Vy6xgz',
			},
			{
				quote:
					'I used to have several magazine subscriptions and now I have all of it at Readup. ',
				reader: 'Pegeen',
				sourceSlug: 'organizer-sandbox',
				articleSlug: '7-overlooked-signs-youre-living-an-extraordinary-life',
				commentId: 'Vy6Onz',
			},
			{
				quote: 'I’m so grateful to have Readup in my life.',
				reader: 'KaylaLola',
				sourceSlug: 'blogreadupcom',
				articleSlug: 'the-readup-manifesto',
				commentId: 'V6Qbl5',
			},
			{
				quote: 'Readup has fundamentally changed the way I read online.',
				reader: 'bartadamley',
				sourceSlug: 'ribbonfarm',
				articleSlug: 'a-text-renaissance',
				commentId: '54vELz',
			},
			{
				quote: 'Readup gave me my brain back!',
				reader: 'Karenz',
				sourceSlug: 'the-new-york-review-of-books',
				articleSlug: 'how-the-awful-stuff-won',
				commentId: 'VXwN75',
			},
			{
				quote: 'Love Readup and love recommending it to my friends and family.',
				reader: 'skrt',
				sourceSlug: 'blogreadupcom',
				articleSlug: '2020---the-readup-year-in-review',
				commentId: 'zjy4mV',
			},
			{
				quote:
					'It’s fascinating to see (and super exciting to be part of) Readup’s growth. Here’s to so much more 🥂❤️✨',
				reader: 'chrissetiana',
				sourceSlug: 'washingtonpost',
				articleSlug:
					'serious-reading-takes-a-hit-from-online-scanning-and-skimming-researchers-say',
				commentId: 'D9BoO5',
			},
			{
				quote:
					'I cherish Readup as a safe place for productive and empathic conversation.',
				reader: 'thorgalle',
				sourceSlug: 'slack-filescom',
				articleSlug: 'readups-purpose--slack',
				commentId: 'DBvMoD',
			},
			{
				quote:
					'There is something inherently decent and civil about reading on Readup. It will be an important experiment to see if it can stay a healthy community.',
				reader: 'Plum',
				sourceSlug: 'getrevueco',
				articleSlug:
					'-trump-ban-referred-readups-reluctance-and-taking-down-tiktok',
				commentId: 'DBvX0D',
			},
			{
				quote:
					'I’m a believer in this project and eager to see what the market will say.',
				reader: 'Raven',
				sourceSlug: 'blogreadupcom',
				articleSlug: 'check-out-the-new-readup-homepage',
				commentId: 'zvgpvD',
			},
		];

		return (
			<div className="marketing-screen_n5a6wc">
				<HomePanel className="home-hero-image">
					<div className="home-hero-image__intro-text">
						<h1 className="heading-small">Readup is a social reading platform that respects your time and rewards your attention.</h1>
					</div>
					<img
						className="home-hero-image__image"
						src={this.props.onCreateStaticContentUrl(
							'/app/images/home/readup-hero.png'
						)}
						alt="A woman and man sit on a bench under a tree.
							The woman enjoys reading a long article on her phone, the man is scrolling through social media feeds."
					/>
				</HomePanel>
				<HomePanel data-nosnippet>
					{valuePoints.map((pointData, i) => (
						<ImageAndText
							{...pointData}
							key={pointData.imageName}
							onCreateStaticContentUrl={this.props.onCreateStaticContentUrl}
							imageRight={!(i % 2 === 0)}
							type="contained"
						/>
					))}
				</HomePanel>
				<HomePanel data-nosnippet className="quote-panel">
					<h2 className="heading-regular">What our readers say</h2>
					<p className="home-section-intro">
						We're proud to improve the lives of internet readers on a daily
						basis.
						<br />
						{/* Check out these spontaneous testimonials from real humans beings. */}
					</p>
					<div className="quote-grid">
						{quotes.map((quote) => (
							<QuoteCard
								key={quote.quote}
								onNavTo={this.props.onNavTo}
								quote={quote}
							/>
						))}
					</div>
				</HomePanel>
				<HomePanel data-nosnippet className="support-section">
					<h2 className="heading-regular">
						Support Us <Icon name="charity" />
					</h2>
					<p>
						A small group of volunteers builds and maintains Readup. Help us
						keep the service up and running!
					</p>
					<div className="oc-support">
						{/*
							https://docs.opencollective.com/help/collectives/widgets
							We're not using the script because it tracks visitors to Sentry.
						*/}
						<Link
							className="button"
							onClick={this.props.onNavTo}
							href="https://opencollective.com/readup-collective/contribute"
						>
							<img
								alt="Contribute to The Readup Collective"
								src="https://opencollective.com/readup-collective/contribute/button@2x.png?color=white"
								width="300"
							/>
						</Link>
						{/*
							See https://docs.opencollective.com/help/collectives/collective-settings/data-export for docs.
							We're not using the script because it tracks visitors to Sentry.
						*/}
						<p>These wonderful people make Readup possible:</p>
						<object
							className="people"
							type="image/svg+xml"
							data="https://opencollective.com/readup-collective/tiers/reader.svg?avatarHeight=48&width=348&button=false&limit=40"
						/>
					</div>
				</HomePanel>
				<JsonLd<Corporation>
					item={{
						'@context': 'https://schema.org',
						'@type': 'Corporation',
						description: 'Social media powered by reading.',
						founders: [
							{
								'@type': 'Person',
								name: 'Bill Loundy',
								url: 'https://billloundy.com/',
							},
							{
								'@type': 'Person',
								name: 'Jeff Camera',
								url: 'https://jeffcamera.com/',
							},
						],
						legalName: 'reallyread.it, inc.',
						location: {
							'@type': 'Place',
							address: {
								'@type': 'PostalAddress',
								addressCountry: 'USA',
								addressLocality: 'Toms River',
								addressRegion: 'New Jersey',
							},
						},
						logo: 'https://static.readup.org/media/logo-512.png',
						naics: '519130',
						name: 'Readup',
						slogan: 'The best way to find, read and share articles online.',
						url: 'https://readup.org/',
					}}
				/>
			</div>
		);
	}
}
export function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Props
) {
	return {
		create: (
			id: number,
			location: RouteLocation,
		) => ({
			id,
			key,
			location,
			title: {
				default: 'What is Readup?'
			},
		}),
		render: () => (
			<MarketingScreen
				{...deps}
			/>
		),
	};
}
