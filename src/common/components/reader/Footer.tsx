import * as React from 'react';
import RatingSelector from '../RatingSelector';

interface Props {
	children?: React.ReactNode,
	onSelectRating: (rating: number) => Promise<{}>,
	ratingScore: number | null
}
export default (props: Props) => (
	<div className="footer_sg74y0">
		<div className="greeting-text">Nice work.</div>
		<RatingSelector {...props} />
		{props.children}
	</div>
);