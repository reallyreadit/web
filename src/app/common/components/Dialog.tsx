import * as React from 'react';
import Button from '../../../common/components/Button';
import PureContextComponent from '../PureContextComponent';
import Context from '../Context';
import { IconName } from '../../../common/components/Icon';
import { Intent } from '../Page';

interface State {
	showErrors: boolean,
	isLoading: boolean,
	isSubmitting: boolean
}
export { State };
export default abstract class Dialog<T, P, S extends Partial<State>> extends PureContextComponent<P, S> {
	private readonly _title: string;
	private readonly _submitButtonIcon: IconName;
	private readonly _submitButtonText: string;
	private readonly _successMessage: string;
	private readonly _submit = () => {
		this.setState({ showErrors: true });
		if (
			!this
				.getClientErrors()
				.some(errors => Object.keys(errors).some(key => !!(errors as { [key: string]: string })[key]))
		) {
			this.clearServerErrors();
			this.setState(
				{ isSubmitting: true },
				() => this
					.submitForm()
					.then(result => {
						this._close();
						if (this._successMessage) {
							this.context.page.showToast(this._successMessage, Intent.Success);
						}
						this.onSuccess(result);
					})
					.catch(errors => {
						this.setState({ isSubmitting: false });
						this.onError(errors);
					})
			);
		}
	};
	private _close = () => this.context.page.closeDialog();
	constructor(params: {
		title: string,
		submitButtonIcon?: IconName,
		submitButtonText: string,
		successMessage?: string
	},
		props: P,
		context: Context
	) {
		super(props, context);
		this._title = params.title;
		this._submitButtonIcon = params.submitButtonIcon || 'checkmark';
		this._submitButtonText = params.submitButtonText;
		this._successMessage = params.successMessage;
		this.state = {
			showErrors: false,
			isLoading: false,
			isSubmitting: false
		} as S;
	}
	protected abstract renderFields(): JSX.Element | JSX.Element[];
	protected getClientErrors(): { [key: string]: string }[] {
		return [];
	};
	protected clearServerErrors() { }
	protected abstract submitForm(): Promise<T>;
	protected onSuccess(result: T) { }
	protected onError(errors: string[]) { }
	public render() {
		return (
			<div className="dialog">
				<h3>{this._title}</h3>
				{this.renderFields()}
				<div className="buttons">
					<Button
						text="Cancel"
						iconLeft="forbid"
						onClick={this._close}
						state={(this.state.isLoading || this.state.isSubmitting) ? 'disabled' : 'normal'} />
					<Button
						text={this._submitButtonText}
						iconLeft={this._submitButtonIcon}
						onClick={this._submit}
						style="preferred"
						state={
							this.state.isLoading ? 'disabled' :
								this.state.isSubmitting ? 'busy' :
								'normal'
						}
					/>
				</div>
			</div>
		);
	}
}