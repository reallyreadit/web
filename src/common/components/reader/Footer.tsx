import * as React from 'react';
import classNames from 'classnames';
import Fetchable from '../../Fetchable';

interface Props {
	onSelectRating: (rating: number) => Promise<{}>,
	progress: Fetchable<{
		isRead: boolean,
		percentComplete: number
	}>,
	selectedRating: number | null
}
export default class extends React.PureComponent<
	Props,
	{ isSelectingRating: boolean } 
> {
	private readonly _selectRating = (event: React.MouseEvent<HTMLButtonElement>) => {
		if (!event.currentTarget.disabled) {
			this.setState({ isSelectingRating: true });
			this.props
				.onSelectRating(parseInt(event.currentTarget.value))
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
				{this.props.progress.isLoading ?
					<span>Loading...</span> :
					this.props.progress.value.isRead ?
						<span>
							You finished! Nice work!<br />
							Are you glad you read the whole thing?<br />
							<label>No</label>
								{Array
									.from(new Array(10))
									.map((e, i) => {
										const value = i + 1;
										return (
											<button
												className={classNames({ 'selected': value === this.props.selectedRating })}
												disabled={this.state.isSelectingRating}
												key={i}
												onClick={this._selectRating}
												value={value}
											>
												{value}
											</button>
										);
								})}
							<label>Yes</label>
							<br />
							{this.state.isSelectingRating ?
								<span>Saving rating...</span> :
								null}
							{this.props.selectedRating != null ?
								<span>
									<strong>Thanks!</strong><br />
									<button>Comments</button>
								</span> :
								null}
						</span> :
						<span>You've read {Math.floor(this.props.progress.value.percentComplete)}% of this story.</span>}
			</div>
		);
	}
}