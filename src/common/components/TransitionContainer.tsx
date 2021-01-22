import * as React from 'react';
import * as classNames from 'classnames';

interface Props {
	children: React.ReactNode,
	isTransitioning: boolean,
	onTransitionComplete: () => void
}
interface State {
	hasChanged: boolean
}
export default class TransitionContainer extends React.Component<Props, State> {
	private readonly _handleAnimationEnd = (event: React.AnimationEvent) => {
		if (event.animationName === 'transition-container_ko0vbz-fade-out') {
			this.setState(
				{
					hasChanged: true
				},
				this.props.onTransitionComplete
			);
		}
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			hasChanged: false
		};
	}
	public render() {
		return (
			<div
				className={
					classNames(
						'transition-container_ko0vbz',
						{
							'changing': this.props.isTransitioning,
							'changed': !this.props.isTransitioning && this.state.hasChanged
						}
					)
				}
				onAnimationEnd={this._handleAnimationEnd}
			>
				{this.props.children}
			</div>
		);
	}
}

