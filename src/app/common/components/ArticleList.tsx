import * as React from 'react';
import List from './controls/List';
import Fetchable from '../../../common/Fetchable';
import PageResult from '../../../common/models/PageResult';
import PageSelector from './controls/PageSelector';
import UserArticle from '../../../common/models/UserArticle';
import Rating from '../../../common/models/Rating';
import ArticleUpdatedEvent from '../../../common/models/ArticleUpdatedEvent';
import ShareResponse from '../../../common/sharing/ShareResponse';
import UserAccount from '../../../common/models/UserAccount';
import AsyncTracker from '../../../common/AsyncTracker';
import LoadingOverlay from './controls/LoadingOverlay';
import InfoBox from '../../../common/components/InfoBox';
import ArticleDetails from '../../../common/components/ArticleDetails';
import { ShareEvent } from '../../../common/sharing/ShareEvent';
import { NavReference } from './Root';
import {DeviceType} from '../../../common/DeviceType';
import { ShareChannelData } from '../../../common/sharing/ShareData';

interface Props {
	articles: Fetchable<PageResult<UserArticle>>,
	emptyListMessage: string,
	deviceType: DeviceType,
	onChangeArticles: (articles: Fetchable<PageResult<UserArticle>>) => void,
	onChangePageNumber: (pageNumber: number) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onNavTo: (ref: NavReference) => void,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onShare: (data: ShareEvent) => ShareResponse,
	onShareViaChannel: (data: ShareChannelData) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	paginate: boolean,
	userAccount: UserAccount | null
}
export class ArticleList extends React.Component<Props> {
	private readonly _asyncTracker = new AsyncTracker();
	constructor(props: Props) {
		super(props);
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(
				event => {
					if (
						this.props.articles.value &&
						this.props.articles.value.items.some(article => article.id === event.article.id)
					) {
						this.props.onChangeArticles({
							isLoading: false,
							value: {
								...this.props.articles.value,
								items: this.props.articles.value.items.map(
									article => {
										if (article.id === event.article.id) {
											// merge objects in case the new object is missing properties due to outdated iOS client
											return {
												...article,
												...event.article,
												dateStarred: event.article.dateStarred
											};
										}
										return article;
									}
								)
							}
						});
					}
				}
			)
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		if (this.props.articles.isLoading) {
			return (
				<LoadingOverlay position="static" />
			);
		}
		if (!this.props.articles.value || !this.props.articles.value.items.length) {
			return (
				<InfoBox
					position="static"
					style="normal"
				>
					{!this.props.articles.value ?
						'Error loading posts.' :
						this.props.emptyListMessage}
				</InfoBox>
			);
		}
		return (
			<div className="article-list_ya0vz5">
				<List>
					{this.props.articles.value.items.map(
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
									showAotdMetadata={false}
									user={this.props.userAccount}
								/>
							</li>
						)
					)}
				</List>
				{this.props.paginate ?
					<PageSelector
						pageNumber={this.props.articles.value.pageNumber}
						pageCount={this.props.articles.value.pageCount}
						onChange={this.props.onChangePageNumber}
					/> :
					null}
			</div>
		);
	}
}