import * as React from 'react';
import SpinnerIcon from './SpinnerIcon';
import Icon from './Icon';
import classNames from 'classnames';

export enum State {
	None,
	Saving,
	Saved
}
export default (
	props: {
		state: State
	}
) => (
	props.state === State.Saving ?
		<SpinnerIcon className="save-indicator_5lgdsz" /> :
		<Icon
			className={
				classNames(
					'save-indicator_5lgdsz',
					{
						'none': props.state === State.None,
						'saved': props.state === State.Saved
					}
				)
			}
			name="checkmark"
		/>
);