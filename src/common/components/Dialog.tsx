import * as React from 'react';
import * as className from 'classnames';
import Button from './Button';
import PureContextComponent from '../PureContextComponent';
import Context from '../Context';

abstract class Dialog<P, S> extends PureContextComponent<P, S & {
	isLoading: boolean,
	showErrors: boolean
}> {
	private handleSubmit = () => {
		this.setState({ showErrors: true });
		if (this.validate()) {
			this.setState({ isLoading: true });
			this.onSubmit().then(() => this.setState({ isLoading: false }));
		}
	};
	private handleCancel = () => this.context.dialog.close();
	protected abstract title: string;
	protected abstract className: string;
	constructor(props: P, state: S, context: Context) {
		super(props, context);
		this.state = Object.assign(state, {
			isLoading: false,
			showErrors: false
		});
	}
	protected abstract onSubmit() : Promise<void>;
	protected abstract validate() : boolean;
	protected abstract renderFields() : JSX.Element;
	public render() {
		return (
			<div className={className('dialog', this.className)}>
				<h3>{this.title}</h3>
				{this.renderFields()}
				<div className="buttons">
					<Button onClick={this.handleCancel} state={this.state.isLoading ? 'disabled' : 'normal'}>Cancel</Button>
					<Button onClick={this.handleSubmit} style="preferred" state={this.state.isLoading ? 'busy' : 'normal'}>Create Account</Button>
				</div>
			</div>
		);
	}
}
export default Dialog;