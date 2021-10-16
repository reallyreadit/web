import * as React from 'react';
import Link from '../../../../common/components/Link';
import StickyNote from '../../../../common/components/StickyNote';
import SubscriptionProvider from '../../../../common/models/subscriptions/SubscriptionProvider';
import {calculateFreeViewBalance, FreeTrialCredit, FreeTrialCreditTrigger, isTrialingSubscription, SubscriptionStatus, FreeTrial } from '../../../../common/models/subscriptions/SubscriptionStatus';
import UserArticle from '../../../../common/models/UserArticle';
import ScreenKey from '../../../../common/routing/ScreenKey';
import {NavMethod, NavOptions, NavReference} from '../Root';
import { formatCountable } from '../../../../common/format';

export const findTweetPromoCredit = (freeTrial: FreeTrial): FreeTrialCredit | undefined => {
	return freeTrial.credits.find(c => c.trigger === FreeTrialCreditTrigger.PromoTweetIntended);
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

	if (!isTrialingSubscription(props.subscriptionStatus)) {
		// nothing to show
		return null;
	} else {
		const viewsUsed = props.subscriptionStatus.freeTrial.articleViews.length;
		const viewsRemaining = calculateFreeViewBalance(props.subscriptionStatus.freeTrial);
		const hasPromoTweeted = !!findTweetPromoCredit(props.subscriptionStatus.freeTrial);
		const articlesLeftTitle = `${viewsRemaining} free ${formatCountable(viewsRemaining, 'article')} left`;

		if (props.detailLevel === 'minimal') {
			title = <strong>{articlesLeftTitle}</strong>;
		} else if (viewsUsed === 0) {
			title = <strong>Welcome to Readup!</strong>,
			subLine = <span>Your first 5 articles are on us.</span>
		} else if (viewsUsed > 0 && viewsRemaining > 0 && !hasPromoTweeted) {
			title = <strong>{articlesLeftTitle}</strong>;
			subLine = <span><Link onClick={() => props.onNavTo({
					key: ScreenKey.MyImpact,
				}, {method: NavMethod.ReplaceAll}
			)}>Tweet about Readup</Link> to get 5 more.</span>
		} else if (viewsUsed > 0 && viewsRemaining > 0 && hasPromoTweeted) {
			title = <strong>{articlesLeftTitle}</strong>;
			subLine = <span><Link onClick={props.onOpenSubscriptionPromptDialog}>Subscribe</Link> for unlimited reading</span>
		} else {
			title = <strong>{articlesLeftTitle}</strong>;
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