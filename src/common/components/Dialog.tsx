import * as React from 'react';
import classNames, { ClassValue } from 'classnames';
import Button from './Button';

interface Props {
	children: React.ReactNode,
	className?: ClassValue,
	closeButtonText?: string,
	footer?: React.ReactNode,
	onClose?: () => void,
	onSubmit?: () => Promise<any>,
	size?: 'small',
	submitButtonText?: string,
	textAlign?: 'left' | 'center' | 'right',
	title: string
}
export default class Dialog extends React.PureComponent<
	Props,
	{
		isSubmitting: boolean
	}
> {
	private readonly _close = () => {
		this.props.onClose();
	};
	private readonly _submit = () => {
		this.setState({ isSubmitting: true });
		this.props
			.onSubmit()
			.then(
				() => {
					if (this.props.onClose) {
						this.props.onClose();
					} else {
						this.setState({ isSubmitting: false });
					}
				}
			)
			.catch(
				() => {
					this.setState({ isSubmitting: false });
				}
			);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			isSubmitting: false
		};
	}
	public render() {
		return (
			<div
				className={
					classNames(
						'dialog_1wfm87',
						this.props.className,
						{
							'small': this.props.size === 'small'
						}
					)
				}
			>
				<div className="header">{this.props.title}</div>
				<div className={classNames('children', this.props.textAlign || 'left')}>{this.props.children}</div>
				<div className={
					classNames(
						'buttons',
						this.props.onClose && this.props.onSubmit ?
							'double' :
							'single'
					)
				}>
					{this.props.onClose ?
						<Button
							onClick={this._close}
							state={this.state.isSubmitting ? 'disabled' : 'normal'}
							text={this.props.closeButtonText || 'Close'}
						/> :
						null}
					{this.props.onSubmit ?
						<Button
							onClick={this._submit}
							state={this.state.isSubmitting ? 'busy' : 'normal'}
							style="preferred"
							text={this.props.submitButtonText || 'Submit'}
						/> :
						null}
				</div>
				{this.props.footer}
			</div>
		);
	}
}