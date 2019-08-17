import * as React from 'react';
import classNames from 'classnames';
import Icon, { IconName } from './Icon';
import Spinner from './Spinner';

interface Props {
	align: 'left' | 'center' | 'right',
	display?: 'block' | 'inline',
	text?: string,
	iconLeft?: IconName,
	href?: string,
	style?: 'normal' | 'preferred' | 'loud',
	state?: 'normal' | 'disabled' | 'busy',
	size?: 'normal' | 'large' | 'x-large',
	showIndicator?: boolean,
	onClick?: () => void,
	hoverStyle?: boolean
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
		const sharedProps = {
			children: (
				<>
					{this.props.iconLeft ?
						<Icon name={this.props.iconLeft} /> :
						null}
					<span className="text">{this.props.text}</span>
					{this.props.state === 'busy' ?
						<span className="loading">
							<Spinner />
						</span> :
						null}
				</>
			),
			className: classNames(
				'button_ovrlmi',
				this.props.style,
				this.props.size,
				this.props.display,
				this.props.align,
				{
					busy: this.props.state === 'busy',
					disabled: this.props.state === 'disabled' || this.props.state === 'busy',
					indicator: this.props.showIndicator,
					hover: this.props.hoverStyle
				}
			),
			onClick: this._click
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