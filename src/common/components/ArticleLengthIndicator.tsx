import * as React from 'react';
import readingParameters from '../../common/readingParameters';

export default (props: { wordCount: number }) => (
	<span className="article-length-indicator">
		({Math.round(props.wordCount / readingParameters.averageWordsPerMinute)} min. read)
	</span>
);