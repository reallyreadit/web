import * as React from 'react';
import classNames from 'classnames';
import { Dialog } from '../services/DialogService';

interface Props {
	dialogs: Dialog[],
	onTransitionComplete: (key: number, transition: 'closing' | 'opening') => void,
	style?: 'light' | 'dark',
	verticalAlignment?: 'auto' | 'top'
}
export default class DialogManager extends React.PureComponent<Props> {
	public static defaultProps: Partial<Props> = {
		style: 'dark',
		verticalAlignment: 'auto'
	};
	private readonly _handleAnimationEnd = (event: React.AnimationEvent) => {
		if (event.animationName) {
			const key = parseInt((event.currentTarget as HTMLLIElement).dataset['key']);
			if (event.animationName.startsWith('dialog-manager_b1yvhp-overlay-fade-in')) {
				this.props.onTransitionComplete(key, 'opening');
			}
			if (event.animationName.startsWith('dialog-manager_b1yvhp-overlay-fade-out')) {
				this.props.onTransitionComplete(key, 'closing');
			}
		}
	};
	public render() {
		if (this.props.dialogs.length) {
			return (
				<ol className="dialog-manager_b1yvhp">
					{this.props.dialogs.map(
						(dialog, index) => (
							<li
								className={
									classNames(
										'container',
										this.props.style,
										this.props.verticalAlignment,
										dialog.state,
										{
											'obscured': (
												index < this.props.dialogs.length - 1 &&
												this.props.dialogs[this.props.dialogs.length - 1].state !== 'closing'
											)
										}
									)
								}
								data-key={dialog.key}
								key={dialog.key}
								onAnimationEnd={this._handleAnimationEnd}
							>
								{dialog.element}
							</li>
						)
					)}
				</ol>
			);
		}
		return null;
	}
}