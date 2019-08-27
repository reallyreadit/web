import * as React from 'react';
import { Intent } from '../../../../common/components/Toaster';
import Dialog from '../../../../common/components/Dialog';
import classNames from 'classnames';

export interface Props {
	onCloseDialog: () => void,
	onShowToast: (content: React.ReactNode, intent: Intent) => void
}
export interface State {
	errorMessage: string,
	showErrors: boolean,
	isLoading: boolean
}
export default abstract class FormDialog<T, P, S extends Partial<State>> extends React.PureComponent<P & Props, S> {
	private readonly _className: string;
	private readonly _title: string;
	private readonly _submitButtonText: string;
	private readonly _successMessage: string;
	private readonly _submit = () => {
		this.setState({ showErrors: true });
		if (
			!this
				.getClientErrors()
				.some(errors => Object.keys(errors).some(key => !!(errors as { [key: string]: string })[key]))
		) {
			this.setState({ errorMessage: null });
			return this
				.submitForm()
				.then(result => {
					this.props.onCloseDialog();
					if (this._successMessage) {
						this.props.onShowToast(this._successMessage, Intent.Success);
					}
					this.onSuccess(result);
				})
				.catch(errors => {
					this.onError(errors);
					throw new Error();
				});
		}
		return Promise.reject();
	};
	constructor(
		params: {
			className?: string,
			title: string,
			submitButtonText: string,
			successMessage?: string
		},
		props: P & Props
	) {
		super(props);
		this._className = params.className;
		this._title = params.title;
		this._submitButtonText = params.submitButtonText;
		this._successMessage = params.successMessage;
		this.state = {
			errorMessage: null,
			showErrors: false,
			isLoading: false
		} as S;
	}
	protected abstract renderFields(): JSX.Element | JSX.Element[];
	protected getClientErrors(): { [key: string]: string }[] {
		return [];
	};
	protected abstract submitForm(): Promise<T>;
	protected onSuccess(result: T) { }
	protected onError(errors: string[]) { }
	public render() {
		return (
			<Dialog
				className={classNames('form-dialog_bdppnq', this._className)}
				closeButtonText="Cancel"
				onClose={this.props.onCloseDialog}
				onSubmit={this._submit}
				submitButtonText={this._submitButtonText}
				title={this._title}
			>
				{this.state.errorMessage ?
					<div
						className="error-message"
						dangerouslySetInnerHTML={{ __html: this.state.errorMessage.replace(/\n/g, '<br />') }}
					>
					</div> :
					null}
				{this.renderFields()}
			</Dialog>
		);
	}
}