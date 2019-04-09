import * as React from 'react';
import RatingSelector from '../RatingSelector';

interface Props {
	children?: React.ReactNode,
	onSelectRating: (rating: number) => Promise<{}>,
	ratingScore: number | null
}
export default (props: Props) => (
	<div className="footer_sg74y0">
		<RatingSelector {...props} />
	</div>
);