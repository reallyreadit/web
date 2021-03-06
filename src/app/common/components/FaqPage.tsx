import * as React from 'react';
import ScreenContainer from './ScreenContainer';
import RouteLocation from '../../../common/routing/RouteLocation';

const faqPage = () => (
	<ScreenContainer>
		<div className="faq-page_35vamf">
			Hello FAQ page!
		</div>
	</ScreenContainer>
);
export function createScreenFactory<TScreenKey>(key: TScreenKey) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'Frequently Asked Questions' }),
		render: () => React.createElement(faqPage)
	};
}
export default faqPage;