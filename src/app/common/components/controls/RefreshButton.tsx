import * as React from 'react';
import Icon from '../../../../common/components/Icon';
import classNames from 'classnames';

export default (props: {
	isLoading: boolean,
	onClick: () => void
}) => (
	<Icon
		className={classNames('refresh-button', { 'loading': props.isLoading })}
		name="refresh"
		title="Refresh"
		onClick={props.onClick}
	/>
);