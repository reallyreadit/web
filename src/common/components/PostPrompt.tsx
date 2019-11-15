import * as React from 'react';
import ContentBox from './ContentBox';
import UserArticle from '../models/UserArticle';
import { formatTimestamp, formatList } from '../format';
import PostButton from './PostButton';
import { MenuPosition } from './Popover';

export default (
	props: {
		article: UserArticle,
		onPost: (article: UserArticle) => void,
		promptMessage: string
	}
) => (
	<ContentBox className="post-prompt_de6v6u">
		{props.article.datesPosted.length ?
			<p>You posted this article on {formatList(props.article.datesPosted.map(formatTimestamp))}</p> :
			<p>{props.promptMessage}</p>}
		<PostButton
			article={props.article}
			menuPosition={MenuPosition.TopCenter}
			onPost={props.onPost}
		/>
	</ContentBox>
);