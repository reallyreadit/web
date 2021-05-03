import * as React from 'react';
import Card from './Card';
import { Quote } from './MarketingScreen'
import { NavReference } from '../Root';
import Link from '../../../../common/components/Link';
import ScreenKey from '../../../../common/routing/ScreenKey';

export default (
	props: {
		quote: Quote,
        onNavTo: (ref: NavReference) => void
	}
) => (
    <Card className="quote-card_xa1vt">
        <div className="quote-card_xa1vt__inner">
            <Link
				className="quote-card_xa1vt__quote"
				screen={ScreenKey.Comments}
				params={{
					'sourceSlug': props.quote.sourceSlug,
					'articleSlug': props.quote.articleSlug,
					'commentId': props.quote.commentId
				}}
				onClick={props.onNavTo}
			>
                {props.quote.quote}
			</Link>
            <div className="quote-card_xa1vt__reader">— <Link screen={ScreenKey.Profile} params={{ 'userName': props.quote.reader }} onClick={props.onNavTo}>{props.quote.reader}</Link></div>
        </div>
    </Card>
);


