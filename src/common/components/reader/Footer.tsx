import * as React from 'react';
import RatingSelector from '../RatingSelector';
import UserArticle from '../../models/UserArticle';
import ShareData from '../../sharing/ShareData';
import ShareChannel from '../../sharing/ShareChannel';

export interface Props {
	article: UserArticle,
	children?: React.ReactNode,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onSelectRating: (rating: number) => Promise<{}>,
	onShare: (data: ShareData) => ShareChannel[]
}
export default (props: Props) => (
	<div className="footer_sg74y0">
		<RatingSelector {...props} />
	</div>
);