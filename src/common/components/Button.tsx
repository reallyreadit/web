import * as React from 'react';
import classNames, { ClassValue } from 'classnames';
import Icon, { IconName } from './Icon';
import Spinner from './Spinner';

export type ButtonSize = 'normal' | 'large' | 'x-large';
interface Props {
	align: 'left' | 'center' | 'right',
	className?: ClassValue,
	display?: 'block' | 'inline',
	text?: string,
	iconLeft?: IconName,
	href?: string,
	style?: 'normal' | 'preferred' | 'loud',
	state?: 'normal' | 'disabled' | 'busy' | 'set' | 'selected',
	size?: ButtonSize,
	intent?: 'normal' | 'warning' | 'success'
	showIndicator?: boolean,
	onClick?: () => void,
	onMouseEnter?: () => void,
	onMouseLeave?: () => void
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
			(!this.props.state || this.props.state === 'normal')
		) {
			this.props.onClick();
		}
	};
	public render() {
		let overlayChild: React.ReactNode;
		switch (this.props.state) {
			case 'busy':
				overlayChild = (
					<Spinner />
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
						<Icon name={this.props.iconLeft} /> :
						null}
					<span className="text">{this.props.text}</span>
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