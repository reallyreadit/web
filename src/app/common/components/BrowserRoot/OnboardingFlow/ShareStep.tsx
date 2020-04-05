import * as React from 'react';
import Icon from '../../../../../common/components/Icon';
import Button from '../../../../../common/components/Button';
import ActionLink from '../../../../../common/components/ActionLink';
import * as classNames from 'classnames';
import ShareControl, { MenuPosition } from '../../../../../common/components/ShareControl';
import ShareChannel from '../../../../../common/sharing/ShareChannel';
import ShareData from '../../../../../common/sharing/ShareData';
import UserAccount from '../../../../../common/models/UserAccount';
import { findRouteByKey } from '../../../../../common/routing/Route';
import routes from '../../../../../common/routing/routes';
import ScreenKey from '../../../../../common/routing/ScreenKey';

interface Props {
	onContinue: () => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onShare: (data: ShareData) => ShareChannel[],
	user: UserAccount
}
enum ControlState {
	Skip,
	HidingSkip,
	Continue
}
interface State {
	controlState: ControlState
}
export default class TrackingStep extends React.PureComponent<Props, State> {
	private readonly _getShareData = () => {
		const
			url = this.props.onCreateAbsoluteUrl(
				findRouteByKey(routes, ScreenKey.Profile)
					.createUrl({ userName: this.props.user.name })
			),
			text = 'I\'m reading on Readup! Follow me to see what I\'m reading.';
		return {
			action: 'OrientationShare',
			email: {
				body: text + '\n\n' + url,
				subject: 'Follow me on Readup'
			},
			text,
			url
		};
	};
	private readonly _hideSkipControl = () => {
		if (this.state.controlState === ControlState.Skip) {
			this.setState({
				controlState: ControlState.HidingSkip
			});
		}
	};
	private readonly _showContinueControl = (event: React.AnimationEvent) => {
		if (event.animationName === 'share-step_nw2x7s-fade-out') {
			this.setState({
				controlState: ControlState.Continue
			});
		}
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			controlState: ControlState.Skip
		};
	}
	public render() {
		return (
			<div className="share-step_nw2x7s">
				<h1>Spread the word.</h1>
				<h2>Help us grow. Tell others why you're excited about Readup.</h2>
				<Icon
					display="block"
					name="megaphone"
				/>
				<ShareControl
					menuPosition={MenuPosition.TopCenter}
					onComplete={this._hideSkipControl}
					onCopyTextToClipboard={this.props.onCopyTextToClipboard}
					onGetData={this._getShareData}
					onShare={this.props.onShare}
				>
					<Button
						intent={
							this.state.controlState === ControlState.Continue ?
								'default' :
								'loud'
						}
						size="large"
						text="Share"
					/>
				</ShareControl>
				<div className="controls">
					{this.state.controlState === ControlState.Continue ?
						<Button
							className="continue"
							intent="loud"
							onClick={this.props.onContinue}
							size="large"
							text="Done!"
						/> :
						<ActionLink
							onAnimationEnd={this._showContinueControl}
							className={classNames('skip', { 'hidden': this.state.controlState === ControlState.HidingSkip })}
							onClick={this.props.onContinue}
							text="Maybe Later"
						/>}
				</div>
			</div>
		);
	}
}