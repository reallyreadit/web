import * as React from 'react';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';

interface Props {
	className?: ClassValue,
	disabled?: boolean,
	onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void,
	options: {
		key: string | number,
		value?: string | number
	}[],
	value: string | number
}
export default class SelectList extends React.Component<Props> {
	private readonly _handleBlur = () => {
		// iOS select scroll bug
		if (window.scrollY !== 0) {
			window.scrollTo(0, 0);
		}
	};
	public render() {
		return (
			<select
				className={classNames('select-list_guiajx', this.props.className)}
				disabled={this.props.disabled}
				onBlur={this._handleBlur}
				onChange={this.props.onChange}
				value={this.props.value}
			>
				{this.props.options.map(
					option => (
						<option
							key={option.key}
							value={option.value != null ? option.value : option.key}
						>
							{option.key}
						</option>
					)
				)}
			</select>
		);
	}
}