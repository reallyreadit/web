import * as React from 'react';
import * as className from 'classnames';
import Button from './Button';
import PureContextComponent from '../PureContextComponent';
import Context from '../Context';
import CancelablePromise from '../CancelablePromise';

interface DialogState {
	isLoading: boolean,
	showErrors: boolean
}
abstract class Dialog<P, S extends Partial<DialogState>> extends PureContextComponent<P, S> {
	private submitPromise: CancelablePromise<any>;
	private handleSubmit = () => {
		this.setState({ showErrors: true });
		if (this.validate()) {
			this.setState({ isLoading: true });
			this.submitPromise = this.onSubmit();
			this.submitPromise.promise
				.then(() => {
					this.submitPromise = undefined;
					this.setState({ isLoading: false });
				})
				.catch(reason => {});
		}
	};
	private handleCancel = () => this.context.page.closeDialog();
	protected abstract title: string;
	protected abstract className: string;
	protected abstract submitButtonText: string;
	constructor(props: P, state: S, context: Context) {
		super(props, context);
		this.state = Object.assign({}, state, {
			isLoading: false,
			showErrors: false
		});
	}
	protected abstract onSubmit() : CancelablePromise<void>;
	protected abstract validate() : boolean;
	protected abstract renderFields() : JSX.Element;
	public componentWillUnmount() {
		if (this.submitPromise !== undefined) {
			this.submitPromise.cancel();
		}
	}
	public render() {
		return (
			<div className={className('dialog', this.className)}>
				<h3>{this.title}</h3>
				{this.renderFields()}
				<div className="buttons">
					<Button text="Cancel" iconLeft="forbid" onClick={this.handleCancel} state={this.state.isLoading ? 'disabled' : 'normal'} />
					<Button text={this.submitButtonText} iconLeft="checkmark" onClick={this.handleSubmit} style="preferred" state={this.state.isLoading ? 'busy' : 'normal'} />
				</div>
			</div>
		);
	}
}
export { DialogState };
export default Dialog;