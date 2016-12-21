import * as React from 'react';

interface Props {
	type: 'text' | 'email' | 'password',
	label: string,
	required?: boolean,
	minLength?: number,
	maxLength?: number,
	error?: string,
	showError: boolean,
	onChange: (value: string, isValid: boolean) => void
}
export default class InputField extends React.PureComponent<Props, {
	value: string,
	error: string,
	showError: boolean,
	hasFocus: boolean
}> {
	private static emailRegExp = /.+@.+/;
	private handleFocus = () => {
		this.setState({ hasFocus: true });
	};
	private handleChange = (event: React.FormEvent<HTMLInputElement>) => {
		const value = (event.target as HTMLInputElement).value.trim(),
			  error = this.getError(value);
		this.setState({
			value, error,
			showError: false
		});
		this.props.onChange(value, error === undefined);
	};
	private handleBlur = () => {
		this.setState({
			showError: true,
			hasFocus: false
		});
	};
	constructor (props: Props) {
		super(props);
		this.state = {
			value: '',
			error: this.getError(''),
			showError: false,
			hasFocus: false
		};
	}
	private getError(value: string) {
		if (this.props.required && value === '') {
			return `${this.props.label} is required.`;
		}
		if (this.props.minLength !== undefined && value.length < this.props.minLength) {
			return `At least ${this.props.minLength} character${this.props.minLength > 1 ? 's' : ''} required.`;
		}
		if (this.props.maxLength !== undefined && value.length > this.props.maxLength) {
			return `No more than ${this.props.maxLength} character${this.props.maxLength > 1 ? 's' : ''} allowed.`;
		}
		switch (this.props.type) {
			case 'email':
				if (!InputField.emailRegExp.test(value)) {
					return `Invalid ${this.props.label}.`;
				}
				break;
		}
		return undefined;
	}
	public componentWillReceiveProps(props: Props) {
		if (!this.state.hasFocus) {
			this.setState({ showError: props.showError });
		}
	}
	public render() {
		console.log(`InputField (${this.props.label}): render`);
		return (
			<label className="input-field">
				<strong>{this.props.label}</strong>
				<div className="field-container">
					<input type={this.props.type} onFocus={this.handleFocus} onChange={this.handleChange} onBlur={this.handleBlur} />
					<div className="error">{this.state.showError ? this.state.error || this.props.error : ''}</div>
				</div>
			</label>
		);
	}
}