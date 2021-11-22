import * as React from 'react';
import Popover, { MenuPosition, MenuState } from './Popover';
import UserArticle from '../models/UserArticle';
import RatingSelector from './RatingSelector';
import SaveIndicator, { State as SaveIndicatorState } from './SaveIndicator';
import Rating from '../models/Rating';
import AsyncTracker from '../AsyncTracker';
import Icon from './Icon';

export { MenuPosition } from './Popover';
interface Props {
	article: UserArticle,
	menuPosition: MenuPosition,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	stopPropagation?: boolean
}
export default class RatingControl extends React.PureComponent<
	Props,
	{
		menuState: MenuState,
		saveIndicatorState: SaveIndicatorState
		score: number | null
	}
> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _beginClosingMenu = () => {
		this.setState({
			menuState: MenuState.Closing
		});
	};
	private readonly _closeMenu = () => {
		this.setState({
			menuState: MenuState.Closed
		});
	};
	private readonly _openMenu = () => {
		this.setState({
			menuState: MenuState.Opened,
			saveIndicatorState: SaveIndicatorState.None
		});
	};
	private readonly _rateArticle = (score: number) => {
		this.setState({
			saveIndicatorState: SaveIndicatorState.Saving,
			score
		});
		this.props
			.onRateArticle(this.props.article, score)
			.then(
				this._asyncTracker.addCallback(
					rating => {
						this.setState({
							saveIndicatorState: SaveIndicatorState.Saved,
							score: rating.score
						});
					}
				)
			);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			menuState: MenuState.Closed,
			saveIndicatorState: SaveIndicatorState.None,
			score: props.article.ratingScore
		};
	}
	public componentDidUpdate(prevProps: Props) {
		if (
			this.props.article.ratingScore !== prevProps.article.ratingScore &&
			this.props.article.ratingScore !== this.state.score
		) {
			this.setState({
				score: this.props.article.ratingScore
			});
		}
	}
	public render() {
		const count = this.props.article.ratingCount;
		return (
			<Popover
				className="rating-control_pyy0je"
				menuChildren={
					<div className="content">
						<div className="count">
							{count === 0 ?
								'A reader has yet to rate this article.' :
								count === 1 ?
									'1 reader has rated this article.' :
									`${count} readers have rated this article.`}
						</div>
						{this.props.article.isRead ?
							<>
								<div className="my-rating">
									My Rating: <SaveIndicator state={this.state.saveIndicatorState} />
								</div>
								<RatingSelector
									onChange={this._rateArticle}
									value={this.state.score}
								/>
							</> :
							null}
					</div>
				}
				menuPosition={this.props.menuPosition}
				menuState={this.state.menuState}
				onBeginClosing={this._beginClosingMenu}
				onClose={this._closeMenu}
				onOpen={this._openMenu}
				stopPropagation={this.props.stopPropagation}
			>
				<div className="seal">
					<Icon name="rating-seal" />
					<span className="number">
						{
							this.props.article.averageRatingScore != null ?
								this.props.article.averageRatingScore < 10 ?
									this.props.article.averageRatingScore.toFixed(1) :
									this.props.article.averageRatingScore :
								'-'
						}
					</span>
				</div>
			</Popover>
		);
	}
}