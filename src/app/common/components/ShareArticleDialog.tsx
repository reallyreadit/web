import * as React from 'react';
import Dialog, { Props as DialogProps, State } from './controls/Dialog';
import InputControl from './controls/InputControl';
import InputField from './controls/InputField';
import FormField from './controls/FormField';
import ActionLink from '../../../common/components/ActionLink';
import Icon from '../../../common/components/Icon';
import UserArticle from '../../../common/models/UserArticle';
import Captcha from '../Captcha';
import { Intent } from './Toaster';
import Fetchable from '../serverApi/Fetchable';
import CallbackStore from '../CallbackStore';
import { formatFetchable } from '../../../common/format';
import { FetchFunctionWithParams } from '../serverApi/ServerApi';

interface Props {
	article?: UserArticle,
	captcha: Captcha,
	onGetArticle: FetchFunctionWithParams<{ slug: string }, UserArticle>,
	onShareArticle: (articleId: number, emailAddresses: string[], message: string, captchaResponse: string) => Promise<void>,
	slug?: string
}
interface EmailField {
	id: number,
	value: string,
	error: string | null,
	onChange: (value: string, error: string | null) => void,
	remove: () => void
}
export default class extends Dialog<void, Props, Partial<State> & {
	addresses: EmailField[],
	article: Fetchable<UserArticle>,
	message: string
}> {
	private readonly _callbacks = new CallbackStore();
	private _emailFieldId = 0;
	private _handleMessageChange = (message: string) => this.setState({ message });
	private _addEmailAddress = () => {
		const addresses = this.state.addresses.slice();
		addresses.push(this.createEmailField());
		this.setState({
			...this.state,
			addresses
		});
	};
	private _captchaElement: HTMLDivElement | null = null;
	private readonly _setCaptchaElement = (ref: HTMLDivElement) => {
		this._captchaElement = ref;
	};
	private _captchaId: number | null = null;
	constructor(props: Props & DialogProps) {
		super(
			{
				title: 'Share Article',
				submitButtonText: 'Send',
				successMessage: 'Share email sent!'
			},
			props
		);
		this.state = {
			...this.state,
			addresses: [
				this.createEmailField()
			],
			article: props.article ?
				{
					isLoading: false,
					value: props.article
				} :
				props.onGetArticle(
					{ slug: props.slug },
					this._callbacks.add(article => { this.setState({ article }); })
				),
			message: ''
		};
	}
	private createEmailField(): EmailField {
		const id = this._emailFieldId++;
		return {
			id,
			value: '',
			error: null,
			onChange: (value: string, error: string | null) => {
				const addresses = this.state.addresses.slice();
				let field = addresses.find(field => field.id === id);
				field.value = value;
				field.error = error;
				this.setState({
					...this.state,
					addresses
				});
			},
			remove: () => {
				const addresses = this.state.addresses.slice();
				addresses.splice(
					addresses.findIndex(field => field.id === id),
					1
				);
				this.setState({
					...this.state,
					addresses
				});
			}
		};
	}
	protected renderFields() {
		return (
			<div className="share-article-dialog">
				<h3>{formatFetchable(this.state.article, article => article.title)}</h3>
				<FormField
					label={`Email Address${this.state.addresses.length > 1 ? 'es (bcc\'d)' : ''}`}
					className="email-fields"
				>
					{this.state.addresses.map((field, index) => (
						<div key={field.id} className="email-field">
							<InputControl
								type="email"
								label="Email Address"
								value={field.value}
								autoFocus
								required
								minLength={3}
								maxLength={30}
								error={field.error}
								showError={this.state.showErrors}
								onChange={field.onChange}
							/>
							{index !== 0 ?
								<div
									className="delete-button"
									title="Remove Address"
									onClick={field.remove}
								>
									<Icon name="cancel" />
								</div> :
								null}
						</div>
					))}
					{this.state.addresses.length < 5 ?
						<ActionLink
							iconLeft="plus"
							text="Add Another Address"
							onClick={this._addEmailAddress}
						/> :
						null}
				</FormField>
				<InputField
					className="message-field"
					type="multiline"
					label="Message (optional)"
					value={this.state.message}
					onChange={this._handleMessageChange}
				/>
				<div
					className="captcha"
					ref={this._setCaptchaElement}
				></div>
			</div>
		);
	}
	protected getClientErrors() {
		return [
			this.state.addresses.reduce(
				(errors, field, index) => {
					if (field.error) {
						errors['Email' + index] = field.error;
					}
					return errors;
				},
				{} as { [key: string]: string }
			)
		];
	}
	protected submitForm() {
		return this.props.onShareArticle(
			this.state.article.value.id,
			this.state.addresses.map(field => field.value),
			this.state.message,
			this.props.captcha.getResponse(this._captchaId)
		);
	}
	protected onError(errors: string[]) {
		let errorMessage: string;
		if (errors.some(error => error === 'UnconfirmedEmail')) {
			errorMessage = 'You must confirm your email before you can share.';
		} else if (errors.some(error => error === 'InvalidCaptcha')) {
			errorMessage = 'Invalid Captcha\nPlease Try Again';
		} else {
			errorMessage = 'Error sending email.\nPlease check the addresses.';
		}
		this.props.onShowToast(errorMessage, Intent.Danger);
		this.props.captcha.reset(this._captchaId);
	}
	public componentDidMount() {
		this.props.captcha.onReady().then(captcha => {
			this._captchaId = captcha.render(this._captchaElement, this.props.captcha.siteKeys.shareArticle);
		});
	}
	public componentWillUnmount() {
		this._callbacks.cancel();
	}
}