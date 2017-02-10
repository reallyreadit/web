import * as React from 'react';
import EventEmitter from './EventEmitter';

export default class Dialog extends EventEmitter<{
	'show': React.ReactElement<any>,
	'close': React.ReactElement<any>
}> {
	private activeDialog?: React.ReactElement<any>;
	public show(dialog: React.ReactElement<any>) {
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