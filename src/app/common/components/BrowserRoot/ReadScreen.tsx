import * as React from 'react';
import { Screen } from '../Root';
import { SharedState } from '../BrowserRoot';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserArticle from '../../../../common/models/UserArticle';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { findRouteByKey, findRouteByLocation } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import Fetchable from '../../../../common/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import { formatFetchable, formatList } from '../../../../common/format';
import produce from 'immer';
import { unroutableQueryStringKeys } from '../../../../common/routing/queryString';
import LoadingOverlay from '../controls/LoadingOverlay';
import ScreenContainer from '../ScreenContainer';
import { DeviceType, isMobileDevice } from '../../../../common/DeviceType';
import GetStartedButton from './GetStartedButton';
import Button from '../../../../common/components/Button';
import InfoBox from '../../../../common/components/InfoBox';
import ContentBox from '../../../../common/components/ContentBox';
import classNames = require('classnames');
import { calculateEstimatedReadTime } from '../../../../common/calculate';
import ScreenKey from '../../../../common/routing/ScreenKey';

interface Props {
	article: Fetchable<UserArticle>,
	deviceType: DeviceType,
	location: RouteLocation,
	isExtensionInstalled: boolean,
	onBeginOnboarding: (analyticsAction: string) => void,
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void,
	onCreateStaticContentUrl: (path: string) => string,
	onOpenNewPlatformNotificationRequestDialog: () => void,
	onReadArticle: (article: UserArticle) => void,
	user: UserAccount | null
}
class ReadScreen extends React.PureComponent<Props> {
	// private readonly _readArticle = () => {
	// 	this.props.onReadArticle(this.props.article.value);
	// };
	public componentDidMount() {
		if (
			(
				this.props.user &&
				this.props.isExtensionInstalled &&
				this.props.article.value &&
				localStorage.getItem('extensionReminderAcknowledged')
			) ||
			(
				this.props.article.value?.slug.split('_')[0] === 'blogreadupcom'
			)
		) {
			window.location.href = this.props.article.value.url;
		}
	}
	private renderArticle() {
		// comments link
		const
		[sourceSlug, articleSlug] = this.props.article.value.slug.split('_'),
		articleUrlParams = {
			['articleSlug']: articleSlug,
			['sourceSlug']: sourceSlug
		};
		let commentsLinkHref = findRouteByKey(routes, ScreenKey.Comments)
			.createUrl(articleUrlParams);
		/* To check w @jeff:
			- extension not installed behavior
			- is it important to support absolute urls here? like https://github.com/reallyreadit/web/blob/b45c59076ea5276d25ecd258ab25a68860c96d47/src/common/components/ArticleDetails.tsx#L95
			- should there be an onViewComments handler? https://github.com/reallyreadit/web/blob/b45c59076ea5276d25ecd258ab25a68860c96d47/src/common/components/ArticleDetails.tsx#L34
			- is _readArticle needed anymore? (see uncommented above)
		*/
		return 	(
			<div className="article">
				{this.props.article.value.imageUrl && <img className="article__image" src={this.props.article.value.imageUrl} /> }
				<div className="article__details">
					<span className="top-line">Article</span>
					<div className="title">{this.props.article.value.title}</div>
					{this.props.article.value.source || this.props.article.value.articleAuthors.length ?
						<div className="meta">
							{this.props.article.value.articleAuthors.length ?
								<>By{' '}
								<span className="authors">
									{formatList(this.props.article.value.articleAuthors.map(author => author.name))}
								</span></> :
								null}
							{this.props.article.value.articleAuthors.length && this.props.article.value.source ?
								<span> in </span> :
								null}
							{this.props.article.value.source ?
								<span className="source">
									{this.props.article.value.source}
								</span> :
								null}
						</div> :
						null}
						<span className="extra">{calculateEstimatedReadTime(this.props.article.value.wordCount)} min. read {this.props.article.value.commentCount > 0 ? <>· <a href={commentsLinkHref}>{this.props.article.value.commentCount} comments</a> on Readup</> : null}</span>
				</div>
			</div>);
	}
	public render() {
		return (
				this.props.article.isLoading ?
					<ScreenContainer className="read-screen_ikr26q">
						<LoadingOverlay position="absolute" />
					</ScreenContainer>
					:
					!this.props.article.value ?
						<ScreenContainer className="read-screen_ikr26q">
							<InfoBox
								position="absolute"
								style="normal"
							>
								<p>Article not found.</p>
							</InfoBox>
						</ScreenContainer>
						:
						<>
						<ScreenContainer className="read-screen_ikr26q article-screen-container">
							{this.renderArticle()}
						</ScreenContainer>
						<ScreenContainer className="read-screen_ikr26q">
							<div className="spacer"></div>
							<div className="read-question">How would you like to read the article?</div>
							<div className="spacer"></div>
							<div className={classNames("choice-container", {"mobile": isMobileDevice(this.props.deviceType)}) }>
								<ContentBox className="choice--readup choice">
									{!this.props.user || !this.props.isExtensionInstalled ?
									<>
										<img className="choice__image" src={this.props.onCreateStaticContentUrl(
											`/app/images/read-screen/` + (isMobileDevice(this.props.deviceType) ? `clean-mobile.svg` : `clean-desktop.svg`))} />
										<div className="choice__details">
											<div>
												{/* Readup is the app for reading. Read 100% ad-free, while supporting the writer. */}
												{/* <h2>Readup is the app for reading.</h2> */}
												<h2>100% distraction-free</h2>
												{/* <p className="info">Join {this.props.article.value.firstPoster} and {this.props.article.value.readCount - 1} other readers.  */}
												<p className="info">Readup is the app for reading. Join 4325 readers reading premium articles while supporting writers directly.</p>
											</div>
											<p className="pricing">Pick-your-price, starting from $ 5/mo</p>
											<GetStartedButton
												analyticsAction="ReadScreen"
												deviceType={this.props.deviceType}
												location={this.props.location}
												onBeginOnboarding={this.props.onBeginOnboarding}
												onCopyAppReferrerTextToClipboard={this.props.onCopyAppReferrerTextToClipboard}
												onCreateStaticContentUrl={this.props.onCreateStaticContentUrl}
												onOpenNewPlatformNotificationRequestDialog={this.props.onOpenNewPlatformNotificationRequestDialog}
											/>
										</div>
									</>
									: null }
								</ContentBox>
								<div className="choice--direct choice">
									<img className="choice__image" src={this.props.onCreateStaticContentUrl(
											`/app/images/read-screen/` + (isMobileDevice(this.props.deviceType) ? `distraction-mobile.svg` : `distraction-desktop.svg`))} />
									<div className="choice__details">
										<p className="info">No thanks, maybe later.<br/>I'll try reading it in the browser.</p>
										<Button
											href={this.props.article.value.url}
											hrefPreventDefault={false}
											align='center'
											intent='normal'
											text='Continue to the web'
											>
										</Button>
									</div>
								</div>
							</div>
						</ScreenContainer>
					</>
		);
	}
}
export default function createReadScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'article' | 'location' | 'isExtensionInstalled' | 'user'>> & {
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
						location: screenState.location,
						isExtensionInstalled: sharedState.isExtensionInstalled,
						user: sharedState.user
					}
				} />
			);
		}
	};
}