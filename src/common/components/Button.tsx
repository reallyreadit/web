import * as React from 'react';
import classNames, { ClassValue } from 'classnames';
import Icon, { IconName } from './Icon';
import SpinnerIcon from './SpinnerIcon';

export type ButtonSize = 'normal' | 'large' | 'x-large';
interface Props {
	align: 'left' | 'center' | 'right',
	badge?: number,
	className?: ClassValue,
	display?: 'block' | 'inline',
	href?: string,
	iconLeft?: IconName,
	intent?: 'normal' | 'default' | 'loud' | 'warning' | 'success',
	onClick?: () => void,
	onMouseEnter?: () => void,
	onMouseLeave?: () => void,
	showIndicator?: boolean,
	size?: ButtonSize,
	state?: 'normal' | 'disabled' | 'busy' | 'set' | 'selected',
	style?: 'normal' | 'preferred',
	text?: string
}
export default class Button extends React.PureComponent<Props> {
	public static defaultProps: Partial<Props> = {
		align: 'left',
		display: 'inline'
	};
	private readonly _click = (event: React.MouseEvent) => {
		if (this.props.href) {
			event.preventDefault();
		}
		if (
			this.props.onClick &&
			(
				!this.props.state ||
				this.props.state === 'normal' ||
				this.props.state === 'selected'
			)
		) {
			this.props.onClick();
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
		const sharedProps = {
			children: (
				<>
					{this.props.iconLeft ?
						<Icon
							badge={this.props.badge}
							name={this.props.iconLeft}
						/> :
						null}
					<span className="text">
						{this.props.text}
					</span>
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