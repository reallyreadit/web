import * as React from 'react';
import Icon from '../../../../common/components/Icon';
import * as className from 'classnames';

export default (props: {
	isLoading: boolean,
	onClick: () => void
}) => (
	<Icon
		className={className('refresh-button', { 'loading': props.isLoading })}
		name="refresh"
		title="Refresh"
		onClick={props.onClick}
	/>
);