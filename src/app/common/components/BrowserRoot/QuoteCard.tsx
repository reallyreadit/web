import * as React from 'react';
import Card from './Card';
import ProfileLink from '../../../../common/components/ProfileLink';

export default (
	props: {
		quote: string,
        reader: string,
        onCreateAbsoluteUrl: (path: string) => string,
        onViewProfile: (userName: string) => void
	}
) => (
    <Card className="quote-card_xa1vt">
        <div className="quote-card_xa1vt__inner">
            <p>
                {props.quote}
            </p>
            <div className="quote-card_xa1vt__reader">— <ProfileLink
                onCreateAbsoluteUrl={props.onCreateAbsoluteUrl}
                onViewProfile={props.onViewProfile}
                userName={props.reader}
            /></div>
        </div>
    </Card>
);