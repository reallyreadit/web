import * as React from 'react';
import Icon from '../../../../common/components/Icon';
import classNames = require('classnames');

export default (props: {
	isTransitioningBack: boolean,
	onBack: () => void,
	titles: (string | null)[]
}) => (
	<div className={classNames(
		'header_q3p9go', {
			'has-back-button': props.titles.length > 1,
			'hidden': (props.titles.length === 1 || (props.titles.length === 2 && props.isTransitioningBack)) && !props.titles[0]
		}
	)}>
		{props.titles.length > 1 ?
			<Icon
				name="chevron-left"
				onClick={props.onBack}
			/> :
			null}
		<label className="title">{props.titles[props.titles.length - (props.isTransitioningBack ? 2 : 1)]}</label>
	</div>
);