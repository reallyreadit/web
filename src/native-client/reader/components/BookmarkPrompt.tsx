import * as React from 'react';
import Button from '../../../common/components/Button';
import classNames from 'classnames';

export default (props: {
	isClosing: boolean,
	onCancel: () => void,
	onConfirm: () => void
}) => (
	<div className={classNames('bookmark-prompt_3dkh9o', { 'closing': props.isClosing })}>
		<div className="prompt-text">Want to pick up where you left off?</div>
		<div className="button-container">
			<Button
				onClick={props.onCancel}
				text="No"
			/>
			<Button
				onClick={props.onConfirm}
				style="preferred"
				text="Yes"
			/>
		</div>
	</div>
);