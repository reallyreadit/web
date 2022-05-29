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
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';
import Icon, { IconName } from './Icon';
import SpinnerIcon from './SpinnerIcon';
import AlertBadge from './AlertBadge';

export type ButtonSize = 'normal' | 'large' | 'x-large';
interface Props {
	align: 'left' | 'center' | 'right',
	badge?: number | 'beta',
	className?: ClassValue,
	display?: 'block' | 'inline',
	href?: string,
	hrefPreventDefault?: boolean,
	iconLeft?: IconName,
	iconRight?: IconName,
	intent?: 'normal' | 'default' | 'loud' | 'warning' | 'success' | 'primary',
	onClick?: (event: React.MouseEvent) => void,
	onMouseEnter?: () => void,
	onMouseLeave?: () => void,
	showIndicator?: boolean,
	size?: ButtonSize,
	state?: 'normal' | 'disabled' | 'busy' | 'set' | 'selected',
	stopPropagation?: boolean,
	style?: 'normal' | 'preferred',
	text?: string,
}
export default class Button extends React.PureComponent<Props> {
	public static defaultProps: Pick<Props, 'align' | 'display' | 'hrefPreventDefault'> = {
		align: 'left',
		display: 'inline',
		hrefPreventDefault: true
	};
	private readonly _click = (event: React.MouseEvent) => {
		if (this.props.href && this.props.hrefPreventDefault) {
			event.preventDefault();
		}
		if (this.props.stopPropagation) {
			event.stopPropagation();
		}
		if (
			this.props.onClick &&
			(
				!this.props.state ||
				this.props.state === 'normal' ||
				this.props.state === 'selected'
			)
		) {
			this.props.onClick(event);
		}
	};
	public render() {
		let overlayChild: React.ReactNode;
		switch (this.props.state) {
			case 'busy':
				overlayChild = (
					<SpinnerIcon />
				);
				break;
			case 'set':
				overlayChild = (
					<Icon name="checkmark" />
				);
				break;
		}
		let badgeCount: number | undefined;
		if (typeof this.props.badge === 'number') {
			badgeCount = this.props.badge;
		}
		const sharedProps = {
			children: (
				<>
					{this.props.iconLeft ?
						<Icon
							badge={badgeCount}
							name={this.props.iconLeft}
						/> :
						null}
					<span className="text">
						{this.props.text}
						{
							badgeCount &&
							!this.props.iconLeft &&
							!this.props.iconRight ?
								<AlertBadge count={badgeCount} /> :
								this.props.badge === 'beta' ?
									<span className="beta-badge">Beta</span> :
									null
						}
					</span>
					{this.props.iconRight ?
						<Icon
							badge={badgeCount}
							name={this.props.iconRight}
						/> :
						null}
					{overlayChild ?
						<span className="overlay">
							{overlayChild}
						</span> :
						null}
				</>
			),
			className: classNames(
				'button_ovrlmi',
				this.props.className,
				this.props.style,
				this.props.size,
				this.props.display,
				this.props.align,
				this.props.intent,
				this.props.state,
				{
					indicator: this.props.showIndicator,
					overlay: !!overlayChild
				}
			),
			onClick: this._click,
			onMouseEnter: this.props.onMouseEnter,
			onMouseLeave: this.props.onMouseLeave
		};
		if (this.props.href) {
			return (
				<a {...{ ...sharedProps, href: this.props.href }} />
			);
		}
		return (
			<button {...sharedProps} />
		);
	}
}