import * as React from 'react';
import RatingSelector from '../RatingSelector';

interface Props {
	children?: React.ReactNode,
	isRead: boolean,
	onSelectRating: (rating: number) => Promise<{}>,
	percentComplete: number,
	ratingScore: number | null
}
export default (props: Props) => (
	<div className="footer_sg74y0">
		{props.isRead ?
			<div className="greeting-text">Nice work.</div> :
			null}
		<RatingSelector {...props} />
		{props.children}
	</div>
);