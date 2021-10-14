import * as React from 'react';
import Link from '../../../../common/components/Link';
import StickyNote from '../../../../common/components/StickyNote';
import SubscriptionProvider from '../../../../common/models/subscriptions/SubscriptionProvider';
import {calculateFreeViewBalance, FreeTrialCredit, FreeTrialCreditTrigger, InactiveSubscriptionStatusWithFreeTrialBase, SubscriptionStatus, SubscriptionStatusType} from '../../../../common/models/subscriptions/SubscriptionStatus';
import UserArticle from '../../../../common/models/UserArticle';
import ScreenKey from '../../../../common/routing/ScreenKey';
import {NavOptions, NavReference} from '../Root';

export const findTweetPromoCredit = (subscriptionStatus: SubscriptionStatus): FreeTrialCredit | undefined => {
	// question: what happens with a free for life reader? Will the API assign them credits too?
	if (subscriptionStatus.isUserFreeForLife === false && subscriptionStatus.type != SubscriptionStatusType.Active) {
		return (subscriptionStatus as InactiveSubscriptionStatusWithFreeTrialBase)
					.freeTrial.credits.find(c => c.trigger === FreeTrialCreditTrigger.PromoTweetIntended);
	} else {
		return undefined;
	}
}

const FreeTrialNotice = (
	props: {
		detailLevel?: 'minimal' | 'full',
		onOpenSubscriptionPromptDialog: (article?: UserArticle, provider?: SubscriptionProvider) => void,
		onNavTo: (ref: NavReference, options?: NavOptions) => boolean
		subscriptionStatus: SubscriptionStatus,
	}
) =>  {
	let title: React.ReactNode;
	let subLine: React.ReactNode;

	if (props.subscriptionStatus.isUserFreeForLife
		|| props.subscriptionStatus.type === SubscriptionStatusType.Active) {
		// nothing to say here
		return null;
	} else {
		const trialSubStatus = props.subscriptionStatus as InactiveSubscriptionStatusWithFreeTrialBase;
		const freeTrial = trialSubStatus.freeTrial;
		const viewsUsed = freeTrial.articleViews.length;
		const viewsRemaining = calculateFreeViewBalance(freeTrial);
		const hasPromoTweeted = !!findTweetPromoCredit(props.subscriptionStatus);

		if (props.detailLevel === 'minimal') {
			title = <strong>Free trial: {viewsRemaining} views remaining</strong>;
		} else if (viewsUsed === 0) {
			title = <strong>Welcome to Readup!</strong>,
			subLine = <span>Your first 5 article views are on us.</span>
		} else if (viewsUsed > 0 && viewsRemaining > 0 && !hasPromoTweeted) {
			title = <strong>{viewsRemaining} free article views remaining</strong>;
			subLine = <span><Link screen={ScreenKey.MyImpact} onClick={props.onNavTo}>Tweet about Readup</Link> to get 5 more.</span>
		} else if (viewsUsed > 0 && viewsRemaining > 0 && hasPromoTweeted) {
			title = <strong>{viewsRemaining} free article views remaining</strong>;
			subLine = <span><Link onClick={props.onOpenSubscriptionPromptDialog}>Subsribe</Link> for unlimited reading</span>
		} else {
			title = <strong>{viewsRemaining} free article views remaining</strong>;
			subLine = <span><Link onClick={props.onOpenSubscriptionPromptDialog}>Subscribe</Link> to continue reading</span>
		}
	return (
		<StickyNote type="straight">
			{title}
			{props.detailLevel === 'full' && subLine}
		</StickyNote>);
	}
}

FreeTrialNotice.defaultProps = {
	detailLevel: 'full'
}

export default FreeTrialNotice;