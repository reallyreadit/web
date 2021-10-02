import * as React from 'react';
import { NavReference, ReadArticleReference, Screen } from '../Root';
import { SharedState } from '../Root';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserArticle from '../../../../common/models/UserArticle';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { findRouteByLocation } from '../../../../common/routing/Route';
import routes, { createArticleSlug } from '../../../../common/routing/routes';
import Fetchable from '../../../../common/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import { formatFetchable, formatList } from '../../../../common/format';
import produce from 'immer';
import { unroutableQueryStringKeys } from '../../../../common/routing/queryString';
import LoadingOverlay from '../controls/LoadingOverlay';
import ScreenContainer from '../ScreenContainer';
import { DeviceType, isMobileDevice } from '../../../../common/DeviceType';
import Button from '../../../../common/components/Button';
import InfoBox from '../../../../common/components/InfoBox';
import ContentBox from '../../../../common/components/ContentBox';
import classNames = require('classnames');
import { calculateEstimatedReadTime } from '../../../../common/calculate';
import ScreenKey from '../../../../common/routing/ScreenKey';
import Icon from '../../../../common/components/Icon';
import Link from '../../../../common/components/Link';
import SubscriptionProvider from '../../../../common/models/subscriptions/SubscriptionProvider';

interface Props {
	article: Fetchable<UserArticle>,
	deviceType: DeviceType,
	location: RouteLocation,
	onCanReadArticle: (article: UserArticle) => boolean,
	onCreateStaticContentUrl: (path: string) => string,
	onNavTo: (ref: NavReference) => void,
	onOpenNewPlatformNotificationRequestDialog: () => void,
	onOpenSubscriptionPromptDialog: (article?: ReadArticleReference, provider?: SubscriptionProvider) => void
	onReadArticle: (article: UserArticle) => void,
	user: UserAccount | null
}
class ReadScreen extends React.PureComponent<Props> {
	private readonly _readArticle = () => {
		this.props.onReadArticle(this.props.article.value);
	};

	private readonly _navToExternal = (ev?: React.MouseEvent<HTMLAnchorElement>) => {
		ev?.preventDefault();
		this.props.onNavTo(this.props.article.value.url);
	}

	private renderArticle() {
		// comments link
		const
		[sourceSlug, articleSlug] = this.props.article.value.slug.split('_'),
		articleUrlParams = {
			['articleSlug']: articleSlug,
			['sourceSlug']: sourceSlug
		};
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
						<span className="extra">{calculateEstimatedReadTime(this.props.article.value.wordCount)} min. read {this.props.article.value.commentCount > 0 ? <>·{' '}<Link
							screen={ScreenKey.Comments}
							onClick={this.props.onNavTo}
							params={articleUrlParams}
							>{this.props.article.value.commentCount} comments</Link> on Readup</> : null}</span>
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
									<>
										<img className="choice__image" src={this.props.onCreateStaticContentUrl(
											`/app/images/read-screen/` + (isMobileDevice(this.props.deviceType) ? `clean-mobile.svg` : `clean-desktop.svg`))} />
										<div className="choice__details">
											<div>
												<h2>Read it on Readup,<br/> the app for reading.</h2>
												{/* <p className="info">Join {this.props.article.value.firstPoster} and {this.props.article.value.readCount - 1} other readers.  */}
												<ul className="info dashed">
													<li>Better reading</li>
													<li>100% ad-free</li>
													<li>Pick your price</li>
												</ul>
											</div>
												<Button
													intent="loud"
													onClick={(this.props.onCanReadArticle(this.props.article.value)) ?
															this._readArticle :
															() => this.props.onOpenSubscriptionPromptDialog(this.props.article.value)}
													size="large"
													align="center"
													text="Read Article"
												/>
											</div>
									</>
								</ContentBox>
								<div className="divider">or</div>
								<div className="choice--direct choice">
									<img className="choice__image" src={this.props.onCreateStaticContentUrl(
											`/app/images/read-screen/` + (isMobileDevice(this.props.deviceType) ? `distraction-mobile.svg` : `distraction-desktop.svg`))} />
									<div className="choice__details">
										<p className="info">Read through the noise<br/>
										{' '}<a href={this.props.article.value.url} onClick={this._navToExternal}>on the web</a><Icon name='arrow-ne' className="outlink"></Icon>
										</p>
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
	deps: Pick<Props, Exclude<keyof Props, 'article' | 'location' | 'user'>> & {
		onGetArticle: FetchFunctionWithParams<{ slug: string }, UserArticle>,
		onSetScreenState: (id: number, getNextState: (currentState: Readonly<Screen<Fetchable<UserArticle>>>) => Partial<Screen<Fetchable<UserArticle>>>) => void
	}
) {
	return {
		create: (id: number, location: RouteLocation) => {
			const article = deps.onGetArticle(
				{
					slug: createArticleSlug(
						findRouteByLocation(routes, location, unroutableQueryStringKeys)
							.getPathParams(location.path)
					)
				},
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
						user: sharedState.user
					}
				} />
			);
		}
	};
}