import * as React from 'react';
import Card from './Card';
import { Quote } from './MarketingScreen'
import ProfileLink from '../../../../common/components/ProfileLink';

export default (
	props: {
		quote: Quote,
        onCreateAbsoluteUrl: (path: string) => string,
        onViewProfile: (userName: string) => void
	}
) => (
    <Card className="quote-card_xa1vt">
        <div className="quote-card_xa1vt__inner">
            <p onClick={() => window.open(props.quote.source, '_blank')}>
                {props.quote.quote}
            </p>
            <div className="quote-card_xa1vt__reader">— <ProfileLink
                onCreateAbsoluteUrl={props.onCreateAbsoluteUrl}
                onViewProfile={props.onViewProfile}
                userName={props.quote.reader}
            /></div>
        </div>
    </Card>
);