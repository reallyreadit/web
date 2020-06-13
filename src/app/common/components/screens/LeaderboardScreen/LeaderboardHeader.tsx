import * as React from 'react';
import Icon, { IconName } from '../../../../../common/components/Icon';

export default (
	props: {
		iconName?: IconName,
		onOpenExplainer?: () => void,
		title: string
	}
) => (
	<div className="leaderboard-header_ruu55d">
		{props.iconName ?
			<Icon
				className="icon"
				name={props.iconName}
			/> :
			null}
		<span className="text">{props.title}</span>
		{props.onOpenExplainer ?
			<Icon
				className="icon"
				name="question-circle"
				onClick={props.onOpenExplainer}
			/> :
			null}
	</div>
);