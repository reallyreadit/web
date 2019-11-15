import * as React from 'react';
import classNames from 'classnames';

export default class RatingSelector extends React.PureComponent<{
	allowDeselect?: boolean,
	onChange: (value?: number) => void,
	promptText?: string,
	showLabels?: boolean,
	value?: number
}> {
	private readonly _selectRating = (event: React.MouseEvent<HTMLButtonElement>) => {
		const value = parseInt(event.currentTarget.value);
		if (value !== this.props.value || this.props.allowDeselect) {
			this.props.onChange(
				value !== this.props.value ?
					value :
					null
			);
		}
	};
	public render() {
		return (
			<div className="rating-selector_epcgq9">
				{this.props.promptText ?
					<div className="prompt-text">
						<strong>{this.props.promptText}</strong>
					</div> :
					null}
				<div className="rating-bar">
					{this.props.showLabels ?
						<label>No</label> :
						null}
					<div className="buttons">
						{Array
							.from(new Array(10))
							.map((e, i) => {
								const value = i + 1;
								return (
									<button
										className={classNames(
											'rating-button',
											{ 'selected': value === this.props.value }
										)}
										key={i}
										onClick={this._selectRating}
										value={value}
									>
										{value}
									</button>
								);
							})}
					</div>
					{this.props.showLabels ?
						<label>Yes</label> :
						null}
				</div>
			</div>
		);
	}
}