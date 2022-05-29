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
import Icon from '../../common/components/Icon';
import UserArticle from '../../common/models/UserArticle';
import { calculateEstimatedReadTime } from '../../common/calculate';

const
	origin = {
		x: 50,
		y: 50
	},
	radius = 50,
	quadrants = [
		{
			deg: 90,
			point: {
				x: 100,
				y: 0
			},
		},
		{
			deg: 180,
			point: {
				x: 100,
				y: 100
			}
		},
		{
			deg: 270,
			point: {
				x: 0,
				y: 100
			}
		},
		{
			deg: 360,
			point: {
				x: 0,
				y: 0
			}
		}
	];
function createRadialClipPath(degrees: number) {
	// start at the center and move to 0 deg
	const points = [
		origin,
		{
			x: 50,
			y: 0
		}
	];
	// find the quadrant matching the degrees
	const quadrantIndex = quadrants.findIndex(
		quadrant => quadrant.deg >= degrees
	);
	// add points up to and including the matching quadrant
	points.push(
		...quadrants
			.slice(0, quadrantIndex + 1)
			.map(
				quadrant => quadrant.point
			)
	);
	// add the circumference point
	const radians = (degrees - 90) * (Math.PI / 180);
	points.push({
		x: origin.x + (radius * Math.cos(radians)),
		y: origin.y + (radius * Math.sin(radians))
	});
	// return value
	return (
		'polygon(' +
		points
			.map(
				point => `${Math.round(point.x)}% ${Math.round(point.y)}%`
			)
			.join(', ') +
		')'
	);
}
enum Visibility {
	Initial = 'visibility-initial',
	Opening = 'visibility-opening',
	Open = 'visibility-open',
	Closing = 'visibility-closing',
	Closed = 'visibility-closed'
}
interface Props {
	article: UserArticle
}
interface State {
	visibility: Visibility
}
export default class ProgressIndicator extends React.Component<Props, State> {
	private readonly _handleAnimationEnd = (event: React.AnimationEvent) => {
		let nextVisibility: Visibility;
		if (
			event.animationName === 'progress-indicator_vgryrl-pop-in' ||
			event.animationName === 'progress-indicator_vgryrl-slide-in'
		) {
			nextVisibility = Visibility.Open;
		} else if (
			event.animationName === 'progress-indicator_vgryrl-slide-out'
		) {
			nextVisibility = Visibility.Closed;
		}
		if (nextVisibility) {
			this.setState({
				visibility: nextVisibility
			});
		}
	};
	private readonly _toggleVisibility = () => {
		if (
			this.state.visibility === Visibility.Initial ||
			this.state.visibility === Visibility.Opening ||
			this.state.visibility === Visibility.Closing
		) {
			return;
		}
		this.setState({
			visibility: (
				this.state.visibility === Visibility.Open ?
					Visibility.Closing :
					Visibility.Opening
			)
		});
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			visibility: Visibility.Initial
		};
	}
	public render() {
		return (
			<div
				className={
					classNames('progress-indicator_vgryrl', this.state.visibility)
				}
				onAnimationEnd={this._handleAnimationEnd}
			>
				<div
					className="handle"
					onClick={this._toggleVisibility}
				>
					<Icon
						badge={false}
						name={
							this.state.visibility === Visibility.Initial ||
							this.state.visibility === Visibility.Open ||
							this.state.visibility === Visibility.Closing ?
								'chevron-right' :
								'chevron-left'
						}
					/>
				</div>
				<div className="indicator">
					<div className="progress">
						<div
							className={classNames('fill', { 'complete': this.props.article.isRead })}
							style={{
								clipPath: createRadialClipPath(300 * (this.props.article.percentComplete / 100))
							}}
						>
						</div>
					</div>
					<div className="logo"></div>
						<div className="label">{Math.floor(this.props.article.percentComplete)}%</div>
				</div>
				<div className="length">{calculateEstimatedReadTime(this.props.article.wordCount)} min. read</div>
			</div>
		);
	}
}