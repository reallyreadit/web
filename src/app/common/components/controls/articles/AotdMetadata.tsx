import * as React from 'react';
import UserArticle from '../../../../../common/models/UserArticle';
import UserAccount from '../../../../../common/models/UserAccount';
import classNames from 'classnames';
import ProfileLink from '../../../../../common/components/ProfileLink';

export default (
	props: {
		article: UserArticle,
		onCreateAbsoluteUrl: (path: string) => string,
		onViewProfile: (userName: string) => void,
		pointsCallout?: React.ReactNode,
		rank?: number,
		rankCallout?: React.ReactNode,
		user: UserAccount | null
	}
) => (
	<div className="aotd-metadata_3itnfw">
		{props.rank != null ?
			<div className={classNames('rank', 'length-' + props.rank.toString().length.toString())}>
				<small>#</small> {props.rank}
				{props.rankCallout}
			</div> :
			null}
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
				null}
		</div>
	</div>
);