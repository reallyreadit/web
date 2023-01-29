// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as React from 'react';
import Filter from './Filter';
import { formatCountable } from '../../../../../common/format';
import AsyncTracker from '../../../../../common/AsyncTracker';

const floor = 1,
	ceil = 60;
interface Props {
	max: number | null;
	min: number | null;
	onChange: (min: number | null, max: number | null) => void;
}
interface State {
	contentHeight: number;
	min: number;
	max: number;
}
export default class ArticleLengthFilter extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeMaxLength = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const max = parseInt(event.target.value);
		this.setState(
			{
				min:
					this.state.min == null || this.state.min <= max
						? this.state.min
						: max,
				max,
			},
			this._filter
		);
	};
	private readonly _changeMinLength = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const min = parseInt(event.target.value);
		this.setState(
			{
				min,
				max:
					this.state.max == null || this.state.max >= min
						? this.state.max
						: min,
			},
			this._filter
		);
	};
	private readonly _contentRef = React.createRef<HTMLDivElement>();
	private readonly _filter = () => {
		if (
			(this.state.min !== floor ? this.state.min : null) != this.props.min ||
			(this.state.max !== ceil ? this.state.max : null) != this.props.max
		) {
			const min = this.state.min,
				max = this.state.max;
			this._asyncTracker.cancelAll();
			this._asyncTracker.addTimeout(
				window.setTimeout(() => {
					this.props.onChange(min, max);
				}, 1000)
			);
		}
	};
	private readonly _setContentHeight = (contentHeight: number) => {
		this.setState({
			contentHeight,
		});
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			contentHeight: 0,
			max: props.max != null ? props.max : ceil,
			min: props.min != null ? props.min : floor,
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<Filter
				className="article-length-filter_fx9wpo"
				contentHeight={this.state.contentHeight}
				contentRef={this._contentRef}
				onSetContentHeight={this._setContentHeight}
				subtitle={
					this.state.min === floor && this.state.max === ceil
						? ''
						: this.state.min === this.state.max && this.state.max !== ceil
						? `${this.state.min} ${formatCountable(this.state.min, 'minute')}`
						: this.state.min === floor
						? `≤ ${this.state.max} minutes`
						: this.state.max === ceil
						? `≥ ${this.state.min} minutes`
						: `${this.state.min} - ${this.state.max} minutes`
				}
				title="Article Length"
			>
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
			</Filter>
		);
	}
}
