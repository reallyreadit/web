import * as React from 'react';
import * as className from 'classnames';
import Context, { contextTypes } from '../../Context';

export default class DialogManager extends React.PureComponent<{}, {}> {
	public static contextTypes = contextTypes;
	public context: Context;
	private readonly _forceUpdate = () => this.forceUpdate();
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