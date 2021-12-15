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