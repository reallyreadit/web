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
import * as classNames from 'classnames';
import Filter, { measureAutoHeight } from './Filter';
import SearchOption from '../../../../../common/models/articles/SearchOption';

interface Props {
	onChange: (value: string[]) => void,
	options: SearchOption[],
	title: string,
	value: string[]
}
interface State {
	contentHeight: number,
	displayCount: number
}
export default class MultiSelectFilter extends React.Component<Props, State> {
	private readonly _contentRef = React.createRef<HTMLDivElement>();
	private readonly _maxDisplayCount = 50;
	private readonly _setContentHeight = (contentHeight: number) => {
		this.setState({
			contentHeight
		});
	};
	private readonly _showMore = () => {
		this.setState({
			displayCount: this.state.displayCount + 10
		});
	};
	private readonly _toggleOption = (event: React.MouseEvent<HTMLButtonElement>) => {
		const
			slug = event.currentTarget.value,
			nextValue = this.props.value.slice();
		if (
			this.props.value.includes(slug)
		) {
			nextValue.splice(nextValue.indexOf(slug), 1);
		} else {
			nextValue.push(slug);
		}
		this.props.onChange(nextValue);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			contentHeight: 0,
			displayCount: 10
		};
	}
	public componentDidUpdate(_: Props, prevState: State) {
		if (this.state.displayCount !== prevState.displayCount) {
			this.setState({
				contentHeight: measureAutoHeight(this._contentRef)
			});
		}
	}
	public render() {
		return (
			<Filter
				className="multi-select-filter_vnqq6p"
				contentHeight={this.state.contentHeight}
				contentRef={this._contentRef}
				hideSubtitleWhenOpen
				onSetContentHeight={this._setContentHeight}
				subtitle={
					this.props.value
						.map(
							slug => this.props.options
								.find(
									option => option.slug === slug
								)
								.name
						)
						.sort()
						.join(', ')
				}
				title={this.props.title}
			>
				{this.props.options
					.slice(0, this.state.displayCount)
					.map(
						option => (
							<button
								className={
									classNames(
										'option',
										{
											'selected': this.props.value.includes(option.slug)
										}
									)
								}
								key={option.slug}
								onClick={this._toggleOption}
								value={option.slug}
							>
								{option.name}
							</button>
						)
					)}
				{this.state.displayCount < this._maxDisplayCount ?
					<button
						className="option show-more"
						onClick={this._showMore}
					>
						Show More +
					</button> :
					null}
			</Filter>
		);
	}
}