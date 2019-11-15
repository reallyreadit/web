import * as React from 'react';
import Icon from './Icon';
import classNames, { ClassValue } from 'classnames';

export default (
	props: {
		className?: ClassValue
	}
) => (
	<Icon
		className={classNames('spinner-icon_6s5uk2', props.className)} 
		name="spinner"
	/>
);