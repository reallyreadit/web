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
import AotdRank from './AotdRank';
import AotdScore from './AotdScore';

const AotdMetadata = (
	props: {
		article: Pick<UserArticle, 'aotdContenderRank' | 'aotdTimestamp' | 'firstPoster' | 'hotScore'>,
		onCreateAbsoluteUrl: (path: string) => string,
		onViewProfile: (userName: string) => void,
		pointsCallout?: React.ReactNode,
		rankCallout?: React.ReactNode,
		showPoints?: boolean,
		showScout?: boolean
	}
) => {

	return (
		<div className="aotd-metadata_j18sed">
			<AotdRank
				article={props.article}
				callout={props.rankCallout}
			/>
			<AotdScore
				article={props.article}
				callout={props.pointsCallout}
				onCreateAbsoluteUrl={props.onCreateAbsoluteUrl}
				onViewProfile={props.onViewProfile}
				showPoints={props.showPoints}
				showScout={props.showScout}
			/>
		</div>
	);
};

AotdMetadata.defaultProps = {
	showPoints: true,
	showScout: true
}

export default AotdMetadata;