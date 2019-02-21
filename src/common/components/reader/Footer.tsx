import * as React from 'react';
import classNames from 'classnames';
import logoText from '../../svg/logoText';

interface Props {
	isRead: boolean,
	onSelectRating: (rating: number) => Promise<void>,
	percentComplete: number,
	ratingScore: number | null,
	showLogo: boolean
}
export default class extends React.PureComponent<
	Props,
	{ isSelectingRating: boolean } 
> {
	private readonly _selectRating = (event: React.MouseEvent<HTMLButtonElement>) => {
		let score: number | null;
		if (
			!event.currentTarget.disabled &&
			(
				(score = parseInt(event.currentTarget.value)) !== this.props.ratingScore
			)
		) {
			this.setState({ isSelectingRating: true });
			this.props
				.onSelectRating(score)
				.then(() => {
					this.setState({ isSelectingRating: false });
				});
		}
	};
	constructor(props: Props) {
		super(props);
		this.state = { isSelectingRating: false };
	}
	public render() {
		return (
			<div className="footer_sg74y0">
				{this.props.isRead ?
					<>
						<div className="prompt-text">
							<div className="line-1">Nice work.</div>
							<div className="line-2">
								<strong>Would you recommend this article to others?</strong>
							</div>
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
													{ 'selected': value === this.props.ratingScore }
												)}
												disabled={this.state.isSelectingRating}
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
						{this.state.isSelectingRating ?
							<div className="status-text">Saving rating...</div> :
							this.props.ratingScore != null ?
								<div className="status-text">Thanks for your feedback.</div> :
								null}
					</> :
					<div>You've read {Math.floor(this.props.percentComplete)}% of this article.</div>}
				{this.props.showLogo ?
					<div
						className="logo-text"
						dangerouslySetInnerHTML={{ __html: logoText }}>
					</div> :
					null}
			</div>
		);
	}
}