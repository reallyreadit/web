import * as React from 'react';
import * as className from 'classnames';
import readingParameters from '../readingParameters';

export default (props: { percentComplete: number }) =>
	<span className={className('percent-complete-indicator', { 'unlocked': props.percentComplete >= readingParameters.articleUnlockThreshold })}>
		Percent Complete: {props.percentComplete.toFixed() + '%'}
	</span>;