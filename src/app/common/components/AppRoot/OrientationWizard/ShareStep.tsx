import * as React from 'react';
import Icon from '../../../../../common/components/Icon';
import Button from '../../../../../common/components/Button';
import ActionLink from '../../../../../common/components/ActionLink';

interface Props {
	onShare: () => void,
	onSkip: () => void
}
export default class ShareStep extends React.PureComponent<Props> {
	public render() {
		return (
			<div className="share-step_okemw2">
				<h1>Read with Friends.</h1>
				<h2>Invite your friends to follow you. It makes Readup more fun. (And it helps us grow!)</h2>
				<Icon name="megaphone" />
				<Button
					intent="loud"
					onClick={this.props.onShare}
					size="large"
					text="Share"
				/>
				<ActionLink
					onClick={this.props.onSkip}
					text="Maybe Later"
				/>
			</div>
		);
	}
}