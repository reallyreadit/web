import * as React from 'react';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserArticle from '../../../../common/models/UserArticle';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import { ShareEvent } from '../../../../common/sharing/ShareEvent';
import ShareResponse from '../../../../common/sharing/ShareResponse';
import Fetchable from '../../../../common/Fetchable';
import PageResult from '../../../../common/models/PageResult';
import LoadingOverlay from '../controls/LoadingOverlay';
import AsyncTracker from '../../../../common/AsyncTracker';
import produce from 'immer';
import List from '../controls/List';
import PageSelector from '../controls/PageSelector';
import ArticleDetails from '../../../../common/components/ArticleDetails';
import Rating from '../../../../common/models/Rating';
import UserAccount from '../../../../common/models/UserAccount';
import AuthorArticleQuery from '../../../../common/models/articles/AuthorArticleQuery';
import AuthorProfile from '../../../../common/models/authors/AuthorProfile';
import InfoBox from '../../../../common/components/InfoBox';
import { JsonLd } from 'react-schemaorg';
import { ProfilePage } from 'schema-dts';
import AuthorProfileRequest from '../../../../common/models/authors/AuthorProfileRequest';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { Screen, SharedState, NavMethod, NavOptions } from '../Root';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import ScreenKey from '../../../../common/routing/ScreenKey';
import Panel from '../BrowserRoot/Panel';
import GetStartedButton from '../BrowserRoot/GetStartedButton';
import { DeviceType } from '../../../../common/DeviceType';
import { variants as marketingVariants } from '../../marketingTesting';
import { formatCurrency } from '../../../../common/format';
import Link from '../../../../common/components/Link';

interface Props {
	authorSlug: string,
	deviceType: DeviceType,
	location: RouteLocation,
	onBeginOnboarding: (analyticsAction: string) => void,
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onCreateStaticContentUrl: (path: string) => string,
	onGetAuthorArticles: FetchFunctionWithParams<AuthorArticleQuery, PageResult<UserArticle>>,
	onNavTo: (url: string) => void,
	onOpenNewPlatformNotificationRequestDialog: () => void,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onShare: (data: ShareEvent) => ShareResponse,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string, options?: NavOptions) => void,
	profile: Fetchable<AuthorProfile>,
	user: UserAccount | null
}
interface State {
	articles: Fetchable<PageResult<UserArticle>>,
	isScreenLoading: boolean
}
class AuthorScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changePageNumber = (pageNumber: number) => {
		this.setState({
			articles: {
				isLoading: true
			}
		});
		this.fetchArticles(pageNumber);
	};
	constructor(props: Props) {
		super(props);
		const articles = this.fetchArticles(1);
		this.state = {
			articles,
			isScreenLoading: props.profile.isLoading || articles.isLoading
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(
				event => {
					if (
						this.state.articles.value &&
						this.state.articles.value.items.some(article => article.id === event.article.id)
					) {
						this.setState(produce((prevState: State) => {
							prevState.articles.value.items.forEach((article, index, articles) => {
								if (article.id === event.article.id) {
									// merge objects in case the new object is missing properties due to outdated iOS client
									articles.splice(
										articles.indexOf(article),
										1,
										{
											...article,
											...event.article
										}
									);
								}
							});
						}));
					}
				}
			)
		);
	}
	private fetchArticles(pageNumber: number) {
		return this.props.onGetAuthorArticles(
			{
				slug: this.props.authorSlug,
				pageSize: 40,
				pageNumber,
				minLength: null,
				maxLength: null
			},
			this._asyncTracker.addCallback(
				articles => {
					this.setState({
						articles,
						isScreenLoading: this.props.profile.isLoading
					});
				}
			)
		);
	}
	public componentDidUpdate(prevProps: Props) {
		if (
			prevProps.profile.isLoading &&
			!this.props.profile.isLoading &&
			!this.state.articles.isLoading
		) {
			this.setState({
				isScreenLoading: false
			});
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		const marketingVariant = marketingVariants[0];
		return (
			<div className="author-screen_2cri7v">
				{this.state.isScreenLoading ?
					<LoadingOverlay position="absolute" /> :
					!this.props.profile.value ?
						<InfoBox
							position="absolute"
							style="normal"
						>
							<p>Author not found.</p>
						</InfoBox> :
						<>
							{!this.props.user ?
								<Panel className="header">
									<h1>{marketingVariant.headline}</h1>
									<h3>{marketingVariant.subtext}</h3>
									<div className="buttons">
										<GetStartedButton
											analyticsAction="AuthorScreen"
											deviceType={this.props.deviceType}
											location={this.props.location}
											onBeginOnboarding={this.props.onBeginOnboarding}
											onCopyAppReferrerTextToClipboard={this.props.onCopyAppReferrerTextToClipboard}
											onCreateStaticContentUrl={this.props.onCreateStaticContentUrl}
											onOpenNewPlatformNotificationRequestDialog={this.props.onOpenNewPlatformNotificationRequestDialog}
										/>
									</div>
								</Panel> :
								null}
							<Panel className="main">
								<div className="profile">
									<h1>{this.props.profile.value.name}</h1>
									{this.props.profile.value.totalEarnings ?
										<InfoBox
											position="static"
											style="normal"
										>
											<div className="earnings">
												Total Readup earnings: {formatCurrency(this.props.profile.value.totalEarnings)}
											</div>
											<div className="message">
												Are you {this.props.profile.value.name}?
												<Link href="mailto:support@readup.com" onClick={this.props.onNavTo}>Contact us</Link> to get verified and collect your earnings.
											</div>
										</InfoBox> :
										null}
								</div>
								{this.state.articles.isLoading ?
									<LoadingOverlay position="static" /> :
									!this.state.articles.value ?
										<InfoBox
											position="static"
											style="normal"
										>
											<p>Error loading articles.</p>
										</InfoBox> :
										!this.state.articles.value.items.length ?
											<InfoBox
												position="static"
												style="normal"
											>
												<p>No articles found.</p>
											</InfoBox> :
											<>
												<List>
													{this.state.articles.value.items.map(
														article => (
															<li key={article.id}>
																<ArticleDetails
																	article={article}
																	onCopyTextToClipboard={this.props.onCopyTextToClipboard}
																	onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
																	onNavTo={this.props.onNavTo}
																	onPost={this.props.onPostArticle}
																	onRateArticle={this.props.onRateArticle}
																	onRead={this.props.onReadArticle}
																	onShare={this.props.onShare}
																	onToggleStar={this.props.onToggleArticleStar}
																	onViewComments={this.props.onViewComments}
																	onViewProfile={this.props.onViewProfile}
																	user={this.props.user}
																/>
															</li>
														)
													)}
												</List>
												<PageSelector
													pageNumber={this.state.articles.value.pageNumber}
													pageCount={this.state.articles.value.pageCount}
													onChange={this._changePageNumber}
												/>
											</>}
								<JsonLd<ProfilePage>
									item={{
										"@context": "https://schema.org",
										"@type": "ProfilePage",
										"description": `Articles written by ${this.props.profile.value.name}`,
										"name": this.props.profile.value.name
									}}
								/>
							</Panel>
						</>}
			</div>
		);
	}
}
type Dependencies<TScreenKey> = Pick<Props, Exclude<keyof Props, 'authorSlug' | 'location' | 'profile' | 'user'>> & {
	onCreateTitle: (profile: Fetchable<AuthorProfile>) => string,
	onGetAuthorProfile: FetchFunctionWithParams<AuthorProfileRequest, AuthorProfile>,
	onSetScreenState: (id: number, getNextState: (currentState: Readonly<Screen<Fetchable<AuthorProfile>>>) => Partial<Screen<Fetchable<AuthorProfile>>>) => void
};
function getSlug(location: RouteLocation) {
	return findRouteByKey(routes, ScreenKey.Author)
		.getPathParams(location.path)['slug'];
}
export default function createScreenFactory<TScreenKey>(key: TScreenKey, deps: Dependencies<TScreenKey>) {
	return {
		create: (id: number, location: RouteLocation, sharedState: SharedState) => {
			const profile = deps.onGetAuthorProfile(
				{
					slug: getSlug(location)
				},
				profile => {
					if (profile.value?.userName) {
						deps.onViewProfile(
							profile.value?.userName,
							{
								method: NavMethod.Replace,
								screenId: id
							}
						);
					} else {
						deps.onSetScreenState(
							id,
							produce(
								(currentState: Screen<Fetchable<AuthorProfile>>) => {
									currentState.componentState = profile;
									currentState.title = deps.onCreateTitle(profile);
								}
							)
						);
					}
				}
			);
			return {
				id,
				componentState: profile,
				key,
				location,
				title: deps.onCreateTitle(profile)
			};
		},
		render: (state: Screen<Fetchable<AuthorProfile>>, sharedState: SharedState) => (
			<AuthorScreen
				authorSlug={getSlug(state.location)}
				deviceType={deps.deviceType}
				location={state.location}
				onBeginOnboarding={deps.onBeginOnboarding}
				onCopyAppReferrerTextToClipboard={deps.onCopyAppReferrerTextToClipboard}
				onCopyTextToClipboard={deps.onCopyTextToClipboard}
				onCreateAbsoluteUrl={deps.onCreateAbsoluteUrl}
				onCreateStaticContentUrl={deps.onCreateStaticContentUrl}
				onGetAuthorArticles={deps.onGetAuthorArticles}
				onNavTo={deps.onNavTo}
				onOpenNewPlatformNotificationRequestDialog={deps.onOpenNewPlatformNotificationRequestDialog}
				onPostArticle={deps.onPostArticle}
				onRateArticle={deps.onRateArticle}
				onReadArticle={deps.onReadArticle}
				onRegisterArticleChangeHandler={deps.onRegisterArticleChangeHandler}
				onShare={deps.onShare}
				onToggleArticleStar={deps.onToggleArticleStar}
				onViewComments={deps.onViewComments}
				onViewProfile={deps.onViewProfile}
				profile={state.componentState}
				user={sharedState.user}
			/>
		)
	};
}