import * as React from 'react';
import PureContextComponent from '../PureContextComponent';
import Context from '../Context';
import * as className from 'classnames';

export default class DialogManager extends PureContextComponent<{}, {}> {
	constructor(props: {}, context: Context) {
		super(props, context);
		context.page
			.addListener('openDialog', this.forceUpdate)
			.addListener('closeDialog', this.forceUpdate);
	}
	public componentWillUnmount() {
		this.context.page
			.removeListener('openDialog', this.forceUpdate)
			.removeListener('closeDialog', this.forceUpdate);
	}
	public render() {
		return (
			<div className={className('dialog-manager', { hidden: !this.context.page.activeDialog })}>
				{this.context.page.activeDialog}
			</div>
		);
	}
}