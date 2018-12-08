import * as React from 'react';
import Icon from '../../../../common/components/Icon';

export default (props: {
	content?: React.ReactNode,
	isTransitioningBack: boolean,
	onBack: () => void,
	titles: (React.ReactNode | null)[]
}) => (
	<div className="header_q3p9go">
		<div className="left-content">
			{props.titles.length > 1 && !props.isTransitioningBack ?
				<div
					className="back-button"
					onClick={props.onBack}
				>
					<Icon name="chevron-left" />
				</div> :
					null}
		</div>
		<div className="title">{props.titles[props.titles.length - (props.isTransitioningBack ? 2 : 1)]}</div>
		<div className="right-content">
			{props.content}
		</div>
	</div>
);