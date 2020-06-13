import * as React from 'react';
import Fetchable from '../../../../../common/Fetchable';
import Leaderboards from '../../../../../common/models/Leaderboards';
import LoadingOverlay from '../../controls/LoadingOverlay';
import Leaderboard from './Leaderboard';
import UserAccount from '../../../../../common/models/UserAccount';
import StreakTimer from './StreakTimer';
import { FetchFunction } from '../../../serverApi/ServerApi';
import ArticleUpdatedEvent from '../../../../../common/models/ArticleUpdatedEvent';
import AsyncTracker from '../../../../../common/AsyncTracker';

interface Props {
	onCreateAbsoluteUrl: (path: string) => string,
	onGetLeaderboards: FetchFunction<Leaderboards>,
	onOpenExplainer: (title: string, content: React.ReactNode) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onViewProfile: (userName: string) => void,
	user: UserAccount
}
interface State {
	leaderboards: Fetchable<Leaderboards>
}
export default class extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _openScoutExplainer = () => {
		this.props.onOpenExplainer(
			'What\'s a scout?',
			(
				<p>Scouts find the good stuff. They're the first ones to post new articles that go on to become Article of the Day (AOTD). The leaderboard shows the top Scouts of the last month.</p>
			)
		);
	};
	private readonly _openScribeExplainer = () => {
		this.props.onOpenExplainer(
			'What\'s a scribe?',
			(
				<>
					<p><strong>Thoughtful, interesting conversation is the heart and soul of Readup. Scribes are the top commenters of the past month.</strong></p>
					<p>Scribes earn replies in two ways: (1) by replying to others and (2) by getting replies on their comments.</p>
				</>
			)
		);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			leaderboards: props.onGetLeaderboards(
				this._asyncTracker.addCallback(
					leaderboards => {
						this.setState({
							leaderboards
						});
					}
				)
			)
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(
				event => {
					if (event.isCompletionCommit) {
						props.onGetLeaderboards(
							this._asyncTracker.addCallback(
								leaderboards => {
									this.setState({
										leaderboards
									});
								}
							)
						);
					}
				}
			)
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		const streak = (
			this.state.leaderboards.value ?
				this.state.leaderboards.value.userRankings.streak :
				null
		);
		return (
			<div className="reader-leaderboards_8eclav">
				{this.state.leaderboards.isLoading ?
					<LoadingOverlay /> :
					<div className="leaderboards">
						<Leaderboard
							title="Top readers this week"
							iconName="power"
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onViewProfile={this.props.onViewProfile}
							scoreUnit="read"
							rankings={this.state.leaderboards.value.weeklyReadCount}
							userRanking={this.state.leaderboards.value.userRankings.weeklyReadCount}
							userName={this.props.user.name}
						/>
						<Leaderboard
							title="Top readers of all time"
							iconName="medal"
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onViewProfile={this.props.onViewProfile}
							scoreUnit="read"
							rankings={this.state.leaderboards.value.readCount}
							userRanking={this.state.leaderboards.value.userRankings.readCount}
							userName={this.props.user.name}
						/>
						<Leaderboard
							title="Reading streaks"
							iconName="fire"
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onViewProfile={this.props.onViewProfile}
							scoreUnit="day"
							rankings={this.state.leaderboards.value.streak}
							userRanking={{
								score: streak.dayCount,
								rank: streak.rank
							}}
							userName={this.props.user.name}
							footer={
								streak.dayCount ?
									<div className="streak-status">
										<div className="text">
											{streak.includesToday ?
												'You\'re safe until tomorrow' :
												`Don\'t lose your ${streak.dayCount} day streak!`}
										</div>
										{!streak.includesToday ?
											<div className="timer">
												<StreakTimer
													timeZoneName={this.state.leaderboards.value.timeZoneName}
												/>
											</div> :
											null}
									</div> :
									null
							}
						/>
						<Leaderboard
							title="Scouts"
							iconName="binoculars"
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onViewProfile={this.props.onViewProfile}
							scoreUnit="AOTD"
							rankings={this.state.leaderboards.value.scout}
							userRanking={this.state.leaderboards.value.userRankings.scoutCount}
							userName={this.props.user.name}
							onOpenExplainer={this._openScoutExplainer}
						/>
						<Leaderboard
							title="Scribes"
							iconName="quill"
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onViewProfile={this.props.onViewProfile}
							scoreUnit="reply"
							pluralScoreUnit="replies"
							rankings={this.state.leaderboards.value.scribe}
							userRanking={this.state.leaderboards.value.userRankings.scribeCount}
							userName={this.props.user.name}
							onOpenExplainer={this._openScribeExplainer}
						/>
						<div className="placeholder"></div>
					</div>}
			</div>
		);
	}
}