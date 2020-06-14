import * as React from 'react';
import { IconName } from '../../../../../common/components/Icon';
import LeaderboardRanking from '../../../../../common/models/LeaderboardRanking';
import Ranking from '../../../../../common/models/Ranking';
import ProfileLink from '../../../../../common/components/ProfileLink';
import ContentBox from '../../../../../common/components/ContentBox';
import LeaderboardHeader from './LeaderboardHeader';
import LeaderboardTable from './LeaderboardTable';

export default (
	props: {
		footer?: React.ReactNode,
		iconName?: IconName,
		onCreateAbsoluteUrl: (path: string) => string,
		onOpenExplainer?: () => void,
		onViewProfile: (userName: string) => void,
		scoreUnit: string,
		scoreUnitPlural?: string,
		rankings: LeaderboardRanking[],
		title: string,
		userRanking: Ranking,
		userName: string
	}
) => (
	<ContentBox className="reader-leaderboard_ky3yfu">
		<LeaderboardHeader
			iconName={props.iconName}
			onOpenExplainer={props.onOpenExplainer}
			title={props.title}
		/>
		<LeaderboardTable
			overflowLimit={5}
			rows={
				props.rankings.map(
					ranking => ({
						key: ranking.userName,
						rank: ranking.rank,
						name: (
							ranking.userName !== props.userName ?
								<ProfileLink
									className="link"
									onCreateAbsoluteUrl={props.onCreateAbsoluteUrl}
									onViewProfile={props.onViewProfile}
									userName={ranking.userName}
								/> :
								ranking.userName
						),
						score: ranking.score
					})
				)
			}
			scoreUnit={props.scoreUnit}
			scoreUnitPlural={props.scoreUnitPlural}
		/>
		<hr className="break" />
		<LeaderboardTable
			rows={[{
				key: props.userName,
				rank: props.userRanking.rank,
				name: props.userName,
				score: props.userRanking.score
			}]}
			scoreUnit={props.scoreUnit}
			scoreUnitPlural={props.scoreUnitPlural}
		/>
		<div className="footer">
			{props.footer}
		</div>
	</ContentBox>
);