import * as React from 'react';
import logoText from '../../svg/logoText';
import RatingSelector from '../RatingSelector';

interface Props {
	isRead: boolean,
	onSelectRating: (rating: number) => Promise<{}>,
	percentComplete: number,
	ratingScore: number | null,
	showLogo: boolean
}
export default (props: Props) => (
	<div className="footer_sg74y0">
		{props.isRead ?
			<div className="greeting-text">Nice work.</div> :
			null}
		<RatingSelector {...props} />
		{props.showLogo ?
			<div
				className="logo-text"
				dangerouslySetInnerHTML={{ __html: logoText }}>
			</div> :
			null}
	</div>
);