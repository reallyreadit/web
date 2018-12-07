import * as React from 'react';
import { Carousel } from 'react-responsive-carousel';

export default (props: { showArrows: boolean }) => (
	<Carousel
		className="promo-carousel_mvtpec"
		dynamicHeight
		emulateTouch
		showArrows={props.showArrows}
		showStatus={false}
		showThumbs={false}
	>
		<div>
			<strong>Read Better.</strong>
			Focus your attention on longer, smarter articles.
		</div>
		<div>
			<strong>Read more.</strong>
			Track and improve your ability to read deeply.
		</div>
		<div>
			<strong>Join the conversation.</strong>
			<p>Only those who really read articles can comment.</p>
		</div>
	</Carousel>
);