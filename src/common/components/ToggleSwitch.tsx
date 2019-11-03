import * as React from 'react';

export default class ToggleSwitch extends React.PureComponent<{
	isChecked: boolean,
	onChange: (checked: boolean) => void
}> {
	private readonly _change = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.props.onChange(event.currentTarget.checked);
	};
	public render() {
		return (
			<label className="toggle-switch_t7od1q">
				<input
					type="checkbox"
					checked={this.props.isChecked}
					onChange={this._change}
				/>
				<span className="switch"></span>
			</label>
		);
	}
}