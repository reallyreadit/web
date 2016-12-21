import * as React from 'react';
import EventEmitter from './EventEmitter';

export default class Dialog extends EventEmitter<{
	'show': React.ReactElement<{}>,
	'close': React.ReactElement<{}>
}> {
	private activeDialog?: React.ReactElement<{}>;
	public show(dialog: React.ReactElement<{}>) {
		this.activeDialog = dialog;
		this.emitEvent('show', dialog);
	}
	public close() {
		const dialog = this.activeDialog;
		this.activeDialog = undefined;
		this.emitEvent('close', dialog);
	}
	public getActiveDialog() {
		return this.activeDialog;
	}
}