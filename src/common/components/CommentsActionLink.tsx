import * as React from 'react';
import ActionLink from './ActionLink';

export default (props: {
	commentCount: number,
	onClick?: () => void
}) =>
	<span className="comments-action-link">
		<ActionLink
			text={`${props.commentCount} comment${props.commentCount !== 1 ? 's' : ''}`}
			iconLeft="comments"
			onClick={props.onClick}
			/>
	</span>;