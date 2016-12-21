import * as React from 'react';
import ContextComponent from '../ContextComponent';
import Context from '../Context';
import * as className from 'classnames';

export default class DialogManager extends ContextComponent<{}, {}> {
	constructor(props: {}, context: Context) {
		super(props, context);
		context.dialog
			.addListener('show', this.forceUpdate)
			.addListener('close', this.forceUpdate);
	}
	public componentWillUnmount() {
		this.context.dialog
			.removeListener('show', this.forceUpdate)
			.removeListener('close', this.forceUpdate);
	}
	public render() {
		const activeDialog = this.context.dialog.getActiveDialog();
		return (
			<div className={className('dialog-manager', { hidden: activeDialog === undefined })}>
				{activeDialog}
			</div>
		);
	}
}