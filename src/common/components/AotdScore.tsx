import * as React from 'react';
import UserArticle from '../models/UserArticle';
import { formatTimestamp } from '../format';
import ProfileLink from './ProfileLink';

export default (
	props: {
		article: Pick<UserArticle, 'aotdTimestamp' | 'firstPoster' | 'hotScore'>,
		callout?: React.ReactNode,
		onCreateAbsoluteUrl: (path: string) => string,
		onViewProfile: (userName: string) => void,
	}
) => (
	<div className="aotd-score_ndfcug">
		<span className="points">
			{props.article.aotdTimestamp ?
				`AOTD on ${formatTimestamp(props.article.aotdTimestamp)}` :
				`${props.article.hotScore} pts`}
			{props.callout}
		</span>
		{props.article.firstPoster ?
			<>
				<span> - Scout: </span>
				<ProfileLink
					onCreateAbsoluteUrl={props.onCreateAbsoluteUrl}
					onViewProfile={props.onViewProfile}
					userName={props.article.firstPoster}
				/>
			</> :
			<span> - Be the first to post!</span>}
	</div>
);