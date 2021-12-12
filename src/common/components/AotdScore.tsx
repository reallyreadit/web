import * as React from 'react';
import UserArticle from '../models/UserArticle';
import { formatTimestamp } from '../format';
import ProfileLink from './ProfileLink';

const AotdScore = (
	props: {
		article: Pick<UserArticle, 'aotdTimestamp' | 'firstPoster' | 'hotScore'>,
		callout?: React.ReactNode,
		onCreateAbsoluteUrl: (path: string) => string,
		onViewProfile: (userName: string) => void,
		showPoints?: boolean,
		showScout?: boolean
	}
) => (
	<div className="aotd-score_ndfcug">
		{ props.showPoints ?
			<span className="points">
				{props.article.aotdTimestamp ?
					`AOTD on ${formatTimestamp(props.article.aotdTimestamp)}` :
					`${props.article.hotScore} pts`}
				{props.callout}
			</span> : null
		}
		{props.article.firstPoster && props.showScout ?
			<>
				<span> {props.showPoints ? "-" : null} Scout: </span>
				<ProfileLink
					onCreateAbsoluteUrl={props.onCreateAbsoluteUrl}
					onViewProfile={props.onViewProfile}
					userName={props.article.firstPoster}
				/>
			</> :
			props.showScout ?
				<span> - Be the first to post!</span>
				: null
			}
	</div>
);

AotdScore.defaultProps = {
	showPoints: true,
	showScout: true
}

export default AotdScore;