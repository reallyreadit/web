import * as React from 'react';
import UserArticle from '../models/UserArticle';
import UserAccount from '../models/UserAccount';
import classNames from 'classnames';
import ProfileLink from './ProfileLink';
import AotdPopover from './AotdPopover';

export default (
	props: {
		article: UserArticle,
		onCreateAbsoluteUrl: (path: string) => string,
		onViewProfile: (userName: string) => void,
		pointsCallout?: React.ReactNode,
		rankCallout?: React.ReactNode,
		user: UserAccount | null
	}
) => {
	const isRanked = (
		props.article.aotdContenderRank > 0 &&
		props.article.aotdContenderRank < 1000
	);
	return (
		<div className="aotd-metadata_j18sed">
			<div className={
				classNames(
					'rank',
					!props.article.aotdTimestamp ?
						[
							'contender',
							isRanked ?
								'length-' + props.article.aotdContenderRank.toString().length.toString() :
								null
						] :
						null
						
				)
			}>
				{props.article.aotdTimestamp ?
					<AotdPopover timestamp={props.article.aotdTimestamp} /> :
					isRanked ?
						<>
							<small>#</small> {props.article.aotdContenderRank}
						</> :
						<span className="none">-</span>}
				{props.rankCallout}
			</div>
			<div className="score">
				<span className="points">
					{`${props.article.hotScore} pts`}
					{props.pointsCallout}
				</span>
				{props.article.firstPoster ?
					<>
						<span> - Scout: </span>
						{!props.user || props.user.name !== props.article.firstPoster ?
							<ProfileLink
								onCreateAbsoluteUrl={props.onCreateAbsoluteUrl}
								onViewProfile={props.onViewProfile}
								userName={props.article.firstPoster}
							/> :
							<span>{props.article.firstPoster}</span>}
					</> :
					<span> - Be the first to post!</span>}
			</div>
		</div>
	);
};