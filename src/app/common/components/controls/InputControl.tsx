import * as React from 'react';

const emailRegExp = /.+@.+/;
export interface Props {
	type: 'text' | 'email' | 'password' | 'multiline',
	label: string,
	value?: string,
	error?: string,
	validate?: boolean,
	showError?: boolean,
	onChange?: (value: string, error: string) => void,
	autoFocus?: boolean,
	required?: boolean,
	minLength?: number,
	maxLength?: number
}
export default class extends React.PureComponent<Props, { isEditing: boolean }> {
	public static defaultProps: Partial<Props> = {
		value: '',
		validate: true,
		showError: false,
		onChange: () => { },
		autoFocus: false,
		required: false
	};
	private _handleBlur = () => this.setState({ isEditing: false });
	private _handleChange = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		this.setState({ isEditing: true });
		this.props.onChange(e.currentTarget.value, this._validate(e.currentTarget.value));
	};
	constructor(props: Props) {
		super(props);
		this.state = { isEditing: false };
	}
	private _validate(value: string) {
		if (this.props.validate === false) {
			return null;
		}
		if (this.props.required && value === '') {
			return `${this.props.label} is required.`;
		}
		if (typeof this.props.minLength === 'number' && value.length < this.props.minLength) {
			return `At least ${this.props.minLength} character${this.props.minLength > 1 ? 's' : ''} required`;
		}
		if (typeof this.props.maxLength === 'number' && value.length > this.props.maxLength) {
			return `No more than ${this.props.maxLength} character${this.props.maxLength > 1 ? 's' : ''} allowed`;
		}
		switch (this.props.type) {
			case 'email':
				if (!emailRegExp.test(value)) {
					return `Invalid ${this.props.label}.`;
				}
				break;
		}
		return null;
	}
	public componentDidMount() {
		this.props.onChange(this.props.value, this._validate(this.props.value));
	}
	public componentDidUpdate(prevProps: Props) {
		if (this.props.validate !== prevProps.validate) {
			this.props.onChange(this.props.value, this._validate(this.props.value));
		}
	}
	public render() {
		const inErrorState = !this.state.isEditing && this.props.showError && !!this.props.error;
		const controlProps = {
			autoFocus: this.props.autoFocus,
			value: this.props.value,
			onChange: this._handleChange,
			onBlur: this._handleBlur
		};
		return (
			<div className="input-control">
				{this.props.type === 'multiline' ?
					<textarea {...controlProps}></textarea> :
					<input {...{ ...controlProps, type: this.props.type }} />}
				<div className="error">{inErrorState ? this.props.error : null}</div>
			</div>
		);
	}
}