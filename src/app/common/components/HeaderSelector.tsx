import * as React from 'react';
import classNames from 'classnames';

export default class HeaderSelector extends React.PureComponent<{
	disabled?: boolean,
	items: string[],
	onChange: (value: string) => void,
	value: string
}> {
	private readonly _change = (event: React.MouseEvent<HTMLButtonElement>) => {
		this.props.onChange(event.currentTarget.value);
	};
	public render() {
		return (
			<div className="header-selector_9li9z5">
				{this.props.items.map(
					item => (
						<button
							className={classNames({ 'selected': this.props.value === item })}
							disabled={this.props.disabled}
							key={item}
							onClick={this._change}
							value={item}
						>
							{item}
						</button>
					)
				)}
			</div>
		);
	}
}