import * as React from 'react';
import classNames = require('classnames');
import SubscriptionProvider from '../../../../common/models/subscriptions/SubscriptionProvider';
import {SubscriptionStatus} from '../../../../common/models/subscriptions/SubscriptionStatus';
import UserArticle from '../../../../common/models/UserArticle';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { NavOptions, NavReference, Screen, SharedState } from '../Root';
import ScreenContainer from '../ScreenContainer';
import Button from '../../../../common/components/Button';
import Icon from '../../../../common/components/Icon';
import ShareChannel from '../../../../common/sharing/ShareChannel';
import {ShareChannelData} from '../../../../common/sharing/ShareData';
import ContentBox from '../../../../common/components/ContentBox';
import Link from '../../../../common/components/Link';
import ScreenKey from '../../../../common/routing/ScreenKey';

interface Props {
	onCreateStaticContentUrl: (path: string) => string,
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean,
	onOpenPaymentConfirmationDialog: (invoiceId: string) => void,
	onOpenSubscriptionPromptDialog: (article?: UserArticle, provider?: SubscriptionProvider) => void,
	onShareViaChannel: (data: ShareChannelData) => void,
	subscriptionStatus: SubscriptionStatus
}

interface State { }

class FreeTrialScreen extends React.Component<Props, State> {

	private readonly _openTweetComposer = () => {
		this.props.onShareViaChannel({
			channel: ShareChannel.Twitter,
			// text: truncateText(this.state.data.text, 280 - 25),
			text: "I just finished some articles on Readup, check it out! ",
			url: "https://readup.com",
			// hashtags: [
			// 	'ReadOnReadup'
			// ],
			via: 'ReadupDotCom'
		});
		// TODO: award new reads 10 seconds after clicking?
		// vv not needed?
		// this.completeWithActivityType('Twitter');
	};

	public render() {
		return (
			<ScreenContainer className={ classNames( 'free-trial-screen_4xoojq') }>
				{/* <h2></h2> */}
				<p className="intro">Welcome. Your first article views are on us!</p>
				<ContentBox className="stats">
					<div className="metric views--remaining">5 views remaining</div>
					<Link screen={ScreenKey.MyReads} params={{view: 'history'}} onClick={this.props.onNavTo} className="metric views--used">0 views used</Link>
					<div className="metric articles-completions">0 article completions</div>
				</ContentBox>
				{/* TODO: hide when already tweeted */}
				<div className="tweet-prompt">
					<p>Tweet about Readup for 5 more free views.</p>
					<Button
						intent="loud"
						onClick={this._openTweetComposer}
						iconLeft="twitter"
						size="normal"
						align="center"
						text="Tweet"
					/>
				</div>
				<div className="subscribe-prompt">
					<h2>Become a Reader</h2>
					<ul className="value-points">
						<li><Icon name="checkmark"/>Unlimited, ad-free reading</li>
						<li><Icon name="checkmark"/>Watch your money go to the writers you read</li>
						<li><Icon name="checkmark"/>Pick your price. Starting from 5$/mo.</li>
					</ul>
					<Button
						intent="loud"
						onClick={(_) => this.props.onOpenSubscriptionPromptDialog()}
						size="large"
						align="center"
						text="Subscribe"
					/>
				</div>
			</ScreenContainer>
		);
	}
}

export function createFreeTrialScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'subscriptionStatus'>>
) {
	return {
		create: (id: number, location: RouteLocation) => ({
			id,
			key,
			location,
			title: 'Free Trial'
		}),
		render: (screen: Screen, sharedState: SharedState) => (
			<FreeTrialScreen
				onCreateStaticContentUrl={deps.onCreateStaticContentUrl}
				onNavTo={deps.onNavTo}
				onOpenPaymentConfirmationDialog={deps.onOpenPaymentConfirmationDialog}
				onOpenSubscriptionPromptDialog={deps.onOpenSubscriptionPromptDialog}
				onShareViaChannel={deps.onShareViaChannel}
				subscriptionStatus={sharedState.subscriptionStatus}
			/>
		)
	};
}