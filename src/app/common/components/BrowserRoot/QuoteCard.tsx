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
			<div className="quote-card_xa1vt__inner" style={{fontSize: `${1 + (((150 - props.quote.quote.length) - 29)/(150-29)) * 0.4}em`}}>
					{props.quote.quote}
				<div className="quote-card_xa1vt__reader">— <span className="quote-card_xa1vt__reader__name">{props.quote.reader}</span></div>
			</div>
		</Link>
    </Card>
);


