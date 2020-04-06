import * as React from 'react';
import Popover, { MenuPosition, MenuState } from '../../../../common/components/Popover';
import Button from '../../../../common/components/Button';

const
	floor = 1,
	ceil = 60;
interface Props {
	max?: number,
	min?: number,
	onChange: (min: number | null, max: number | null) => void
}
export default class ArticleLengthFilter extends React.PureComponent<
	Props,
	{
		menuState: MenuState,
		min: number,
		max: number
	}
> {
	private readonly _beginClosingMenu = () => {
		this.setState({ menuState: MenuState.Closing });
	};
	private readonly _clear = () => {
		if (this.props.min != null || this.props.max != null) {
			this.props.onChange(null, null);
		}
		this.setState({
			min: floor,
			max: ceil,
			menuState: MenuState.Closing
		});
	};
	private readonly _changeMaxLength = (event: React.ChangeEvent<HTMLInputElement>) => {
		const max = parseInt(event.target.value);
		this.setState({
			min: this.state.min == null || this.state.min <= max ?
				this.state.min :
				max,
			max
		});
	};
	private readonly _changeMinLength = (event: React.ChangeEvent<HTMLInputElement>) => {
		const min = parseInt(event.target.value);
		this.setState({
			min,
			max: this.state.max == null || this.state.max >= min ?
				this.state.max :
				min
		});
	};
	private readonly _closeMenu = () => {
		this.setState({ menuState: MenuState.Closed });
	};
	private readonly _filter = () => {
		if (
			(this.state.min !== floor ? this.state.min : null) != this.props.min ||
			(this.state.max !== ceil ? this.state.max : null) != this.props.max
		) {
			this.props.onChange(this.state.min, this.state.max);
		}
		this.setState({ menuState: MenuState.Closing });
	};
	private readonly _openMenu = () => {
		this.setState({ menuState: MenuState.Opened });
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			menuState: MenuState.Closed,
			max: props.max != null ? props.max : ceil,
			min: props.min != null ? props.min : floor
		};
	}
	public render() {
		return (
				<Popover
					className="article-length-filter_2dglet"
					menuChildren={
						<div className="controls">
							<div className="inputs">
								<input
									max={ceil}
									min={floor}
									onChange={this._changeMinLength}
									type="range"
									value={this.state.min}
								/>
								<input
									max={ceil}
									min={floor}
									onChange={this._changeMaxLength}
									type="range"
									value={this.state.max}
								/>
							</div>
							<div className="scale">
								<span className="number">{floor}</span>
								<span>minutes</span>
								<span className="number">{ceil}</span>
							</div>
							<div className="buttons">
								<Button
									onClick={this._clear}
									text="Clear"
								/>
								<Button
									onClick={this._filter}
									style="preferred"
									text="Filter"
								/>
							</div>
						</div>
					}
					menuPosition={MenuPosition.BottomCenter}
					menuState={this.state.menuState}
					onBeginClosing={this._beginClosingMenu}
					onClose={this._closeMenu}
					onOpen={this._openMenu}
				>
					{
						this.state.min === floor && this.state.max === ceil ?
							'Filter by Length' :
							this.state.min === this.state.max && this.state.max !== ceil ?
								`Article Length = ${this.state.min} m` :
								this.state.min === floor ?
									`Article Length ≤ ${this.state.max} m` :
									this.state.max === ceil ?
										`Article Length ≥ ${this.state.min} m` :
										`Article Length ${this.state.min} - ${this.state.max} m`

					}
				</Popover>
		);
	}
}