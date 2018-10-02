import * as React from 'react';
import classNames from 'classnames';

export default class extends React.Component<{
	isBusy: boolean
}> {
	public render() {
		return (
			<div className={classNames('button-bar', { 'busy': this.props.isBusy })}>
				{this.props.children}
				<div className="busy-overlay">Processing...</div>
			</div>
		);
	}
}