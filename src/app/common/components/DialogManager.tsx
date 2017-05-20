import * as React from 'react';
import PureContextComponent from '../PureContextComponent';
import * as className from 'classnames';

export default class DialogManager extends PureContextComponent<{}, {}> {
	public componentDidMount() {
		this.context.page
			.addListener('openDialog', this._forceUpdate)
			.addListener('closeDialog', this._forceUpdate);
	}
	public componentWillUnmount() {
		this.context.page
			.removeListener('openDialog', this._forceUpdate)
			.removeListener('closeDialog', this._forceUpdate);
	}
	public render() {
		return (
			<div className={className('dialog-manager', { hidden: !this.context.page.activeDialog })}>
				{this.context.page.activeDialog}
			</div>
		);
	}
}