// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as React from 'react';

const emailRegExp = /.+@.+/,
	usernameRegExp = /^[A-Za-z0-9\-_]+$/;
export interface Props {
	autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
	type: 'text' | 'email' | 'password' | 'multiline' | 'username';
	label: string;
	value?: string;
	error?: string;
	validate?: boolean;
	showError?: boolean;
	onChange?: (value: string, error?: string) => void;
	onEnterKeyPressed?: () => void;
	autoFocus?: boolean;
	required?: boolean;
	minLength?: number;
	maxLength?: number;
}
export default class extends React.PureComponent<
	Props,
	{ isEditing: boolean }
> {
	public static defaultProps: Pick<
		Props,
		'value' | 'validate' | 'showError' | 'onChange' | 'autoFocus' | 'required'
	> = {
		value: '',
		validate: true,
		showError: false,
		onChange: () => {},
		autoFocus: false,
		required: false,
	};
	private _handleFocus = () => {
		// iOS keyboard scroll bug
		if (window.reallyreadit && window.reallyreadit.app) {
			window.reallyreadit.app.isFocusedOnField = true;
		}
	};
	private _handleBlur = () => {
		this.setState({ isEditing: false });
		// iOS keyboard scroll bug
		if (window.reallyreadit && window.reallyreadit.app) {
			window.reallyreadit.app.isFocusedOnField = false;
			window.setTimeout(() => {
				if (!window.reallyreadit.app.isFocusedOnField && window.scrollY !== 0) {
					window.scrollTo(0, 0);
				}
			}, 100);
		}
	};
	private _handleChange = (
		e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		this.setState({ isEditing: true });
		this.props.onChange(
			e.currentTarget.value,
			this._validate(e.currentTarget.value)
		);
	};
	private readonly _handleKeyPress = (event: React.KeyboardEvent) => {
		if (event.which === 13 && this.props.onEnterKeyPressed) {
			this.setState({
				isEditing: false,
			});
			this.props.onEnterKeyPressed();
		}
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
		if (
			typeof this.props.minLength === 'number' &&
			value.length < this.props.minLength
		) {
			return `At least ${this.props.minLength} character${
				this.props.minLength > 1 ? 's' : ''
			} required`;
		}
		if (
			typeof this.props.maxLength === 'number' &&
			value.length > this.props.maxLength
		) {
			return `No more than ${this.props.maxLength} character${
				this.props.maxLength > 1 ? 's' : ''
			} allowed`;
		}
		switch (this.props.type) {
			case 'email':
				if (!emailRegExp.test(value)) {
					return `Invalid ${this.props.label}.`;
				}
				break;
			case 'username':
				if (!usernameRegExp.test(value)) {
					return 'Only letters/numbers/-_ allowed.';
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
		const inErrorState =
			!this.state.isEditing && this.props.showError && !!this.props.error;
		const controlProps = {
			autoCapitalize: this.props.autoCapitalize,
			autoFocus: this.props.autoFocus,
			value: this.props.value,
			onChange: this._handleChange,
			onFocus: this._handleFocus,
			onBlur: this._handleBlur,
		};
		return (
			<div className="input-control_k7j7i9">
				{this.props.type === 'multiline' ? (
					<textarea {...controlProps}></textarea>
				) : (
					<input
						{...{
							...controlProps,
							type: this.props.type,
							onKeyPress: this._handleKeyPress,
						}}
					/>
				)}
				{inErrorState ? <div className="error">{this.props.error}</div> : null}
			</div>
		);
	}
}
