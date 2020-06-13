import * as React from 'react';
import Fetchable from '../../../../../common/Fetchable';
import LoadingOverlay from '../../controls/LoadingOverlay';
import AuthorRanking from '../../../../../common/models/AuthorRanking';
import AuthorLeaderboardsTimeWindow from '../../../../../common/models/stats/AuthorLeaderboardsTimeWindow';
import ContentBox from '../../../../../common/components/ContentBox';
import LeaderboardHeader from './LeaderboardHeader';
import LeaderboardTable from './LeaderboardTable';
import AuthorLink from '../../../../../common/components/AuthorLink';
import SelectList from '../../../../../common/components/SelectList';

interface Props {
	onChangeTimeWindow: (timeWindow: AuthorLeaderboardsTimeWindow) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onOpenExplainer: (title: string, content: React.ReactNode) => void,
	onViewAuthor: (slug: string, name: string) => void,
	rankings: Fetchable<AuthorRanking[]>,
	timeWindow: AuthorLeaderboardsTimeWindow
}
export default class AuthorLeaderboards extends React.Component<Props> {
	private readonly _changeTimeWindow = (event: React.ChangeEvent<HTMLSelectElement>) => {
		this.props.onChangeTimeWindow(
			parseInt(event.target.value, 10) as AuthorLeaderboardsTimeWindow
		);
	};
	private readonly _openExplainer = () => {
		this.props.onOpenExplainer(
			'How are writers ranked?',
			(
				<>
					<p>Writers get 1 point per minute for every complete read of something they wrote.</p>
					<p>For example, if a writer gets 3 reads on a 10-minuter, that's 3 x 10 = 30 points.</p>
				</>
			)
		);
	};
	private readonly _timeWindowOptions = [
		{
			key: 'All Time',
			value: AuthorLeaderboardsTimeWindow.AllTime
		},
		{
			key: 'Past Week',
			value: AuthorLeaderboardsTimeWindow.PastWeek
		},
		{
			key: 'Past Month',
			value: AuthorLeaderboardsTimeWindow.PastMonth
		},
		{
			key: 'Past Year',
			value: AuthorLeaderboardsTimeWindow.PastYear
		}
	];
	public render() {
		return (
			<div className="author-leaderboards_4rtwc1">
				<ContentBox className="leaderboard">
					<LeaderboardHeader
						onOpenExplainer={this._openExplainer}
						title="Top Writers"
					/>
					<div className="controls">
						<SelectList
							disabled={this.props.rankings.isLoading}
							onChange={this._changeTimeWindow}
							options={this._timeWindowOptions}
							value={this.props.timeWindow}
						/>
					</div>
					{this.props.rankings.isLoading ?
						<LoadingOverlay
							position="static"
						/> :
						<LeaderboardTable
							rows={
								this.props.rankings.value.map(
									ranking => ({
										key: ranking.slug,
										rank: ranking.rank,
										name: (
											<AuthorLink
												className="link"
												onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
												onViewAuthor={this.props.onViewAuthor}
												name={ranking.name}
												slug={ranking.slug}
											/>
										),
										score: ranking.score
									})
								)
							}
							scoreUnit="pt"
						/>}
				</ContentBox>
			</div>
		);
	}
}