import * as React from 'react';

interface Props {
	onChange: (value: string) => void,
	options: {
		key: string,
		value?: string
	}[],
	value: string
}
export default class RadioButtons extends React.Component<Props> {
	private readonly _change = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.props.onChange(event.target.value);
	};
	public render() {
		return (
			<span className="radio-buttons_sdytcf">
				{this.props.options.map(
					option => {
						const value = (
							option.value != null ?
								option.value :
								option.key
						);
						return (
							<label key={option.key}>
								<input
									type="radio"
									value={value}
									checked={value === this.props.value}
									onChange={this._change}
								/>
								<span>{option.key}</span>
							</label>
						);
					}
				)}	
			</span>
		);
	}
}