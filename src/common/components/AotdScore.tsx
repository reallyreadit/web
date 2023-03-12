// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as React from 'react';
import UserArticle from '../models/UserArticle';
import { formatTimestamp } from '../format';
import ProfileLink from './ProfileLink';

const AotdScore = (props: {
	article: Pick<UserArticle, 'aotdTimestamp' | 'firstPoster' | 'hotScore'>;
	callout?: React.ReactNode;
	onCreateAbsoluteUrl: (path: string) => string;
	onViewProfile: (userName: string) => void;
	showPoints?: boolean;
	showScout?: boolean;
}) => (
	<div className="aotd-score_ndfcug">
		{props.showPoints ? (
			<span className="points">
				{props.article.aotdTimestamp
					? `AOTD on ${formatTimestamp(props.article.aotdTimestamp)}`
					: `${props.article.hotScore} pts`}
				{props.callout}
			</span>
		) : null}
		{props.article.firstPoster && props.showScout ? (
			<>
				<span> {props.showPoints ? '-' : null} Scout: </span>
				<ProfileLink
					onCreateAbsoluteUrl={props.onCreateAbsoluteUrl}
					onViewProfile={props.onViewProfile}
					userName={props.article.firstPoster}
				/>
			</>
		) : props.showScout ? (
			<span> - Be the first to post!</span>
		) : null}
	</div>
);

AotdScore.defaultProps = {
	showPoints: true,
	showScout: true,
};

export default AotdScore;
