import * as React from 'react';
import classNames from 'classnames';

interface Props {
	count: number
}
interface State {
	visibility: 'visible' | 'hiding' | 'hidden'
}
export default class AlertBadge extends React.PureComponent<Props, State> {
	private readonly _handleAnimationEnd = (event: React.AnimationEvent<HTMLSpanElement>) => {
		if (event.animationName === 'alert-badge_ejzklr-scale-down') {
			this.setState({
				visibility: 'hidden'
			});
		}
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			visibility: props.count ?
				'visible' :
				'hidden'
		};
	}
	public componentDidUpdate(prevProps: Props) {
		if (this.props.count && !prevProps.count) {
			this.setState({
				visibility: 'visible'
			});
		} else if (!this.props.count && prevProps.count) {
			this.setState({
				visibility: 'hiding'
			});
		}
	}
	public render() {
		return (
			<span
				className={
					classNames('alert-badge_ejzklr', this.state.visibility)
				}
				onAnimationEnd={this._handleAnimationEnd}
			>
				{this.props.count}
			</span>
		);
	}
}