import * as React from 'react';
import classNames from 'classnames';

export default class RatingSelector extends React.PureComponent<{
	onChange: (value?: number) => void,
	value?: number
}> {
	private readonly _selectRating = (event: React.MouseEvent<HTMLButtonElement>) => {
		const value = parseInt(event.currentTarget.value);
		this.props.onChange(
			value !== this.props.value ?
				value :
				null
		);
	};
	public render() {
		return (
			<div className="rating-selector_epcgq9">
				<div className="prompt-text">
					<strong>Would you recommend this article to others?</strong>
				</div>
				<div className="rating-bar">
					<label>No</label>
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
					<label>Yes</label>
				</div>
			</div>
		);
	}
}