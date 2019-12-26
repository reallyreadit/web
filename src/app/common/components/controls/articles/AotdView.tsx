import * as React from 'react';
import AotdMetadata from './AotdMetadata';
import ArticleDetails from '../../../../../common/components/ArticleDetails';
import ActionLink from '../../../../../common/components/ActionLink';
import ArticleList from './ArticleList';
import UserArticle from '../../../../../common/models/UserArticle';
import Rating from '../../../../../common/models/Rating';
import ShareData from '../../../../../common/sharing/ShareData';
import ShareChannel from '../../../../../common/sharing/ShareChannel';
import PageResult from '../../../../../common/models/PageResult';
import UserAccount from '../../../../../common/models/UserAccount';
import PointsCallout from './PointsCallout';
import RankCallout from './RankCallout';

export default class AotdView extends React.Component<{
	aotd: UserArticle,
	aotdHasAlert?: boolean,
	articles: PageResult<UserArticle>,
	isPaginated: boolean,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewAotdHistory: () => void,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	user: UserAccount | null
}> {
	public render() {
		return (
			<div className="aotd-view_hgax0h">
				<div className="section-header">Article of the Day</div>
				<div className="aotd">
					<AotdMetadata
						article={this.props.aotd}
						onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
						onViewProfile={this.props.onViewProfile}
						pointsCallout={
							!this.props.user ?
								<PointsCallout /> :
								null
						}
						user={this.props.user}
					/>
					<ArticleDetails
						article={this.props.aotd}
						highlight={this.props.aotdHasAlert}
						isUserSignedIn={!!this.props.user}
						onCopyTextToClipboard={this.props.onCopyTextToClipboard}
						onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
						onPost={this.props.onPostArticle}
						onRateArticle={this.props.onRateArticle}
						onRead={this.props.onReadArticle}
						onShare={this.props.onShare}
						onToggleStar={this.props.onToggleArticleStar}
						onViewComments={this.props.onViewComments}
					/>
					<ActionLink
						text="Previous Winners"
						onClick={this.props.onViewAotdHistory}
					/>
				</div>
				<div className="separator"></div>
				<div className="section-header">Contenders for Tomorrow</div>
				<ArticleList>
					{this.props.articles.items.map(
						(article, index) => {
							let rank = index + 1;
							if (this.props.isPaginated) {
								rank += (this.props.articles.pageNumber - 1) * this.props.articles.pageSize;
							}
							return (
								<li key={article.id}>
									<AotdMetadata
										article={article}
										onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
										onViewProfile={this.props.onViewProfile}
										rank={rank}
										rankCallout={
											index === 0 && !this.props.user ?
												<RankCallout /> :
												null
										}
										user={this.props.user}
									/>
									<ArticleDetails
										article={article}
										isUserSignedIn={!!this.props.user}
										onCopyTextToClipboard={this.props.onCopyTextToClipboard}
										onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
										onPost={this.props.onPostArticle}
										onRateArticle={this.props.onRateArticle}
										onRead={this.props.onReadArticle}
										onShare={this.props.onShare}
										onToggleStar={this.props.onToggleArticleStar}
										onViewComments={this.props.onViewComments}
									/>
								</li>
							);
						})
					}
				</ArticleList>	
			</div>
		);
	}
}