import * as React from 'react';
import ContentBox from './ContentBox';
import UserArticle from '../models/UserArticle';
import { formatTimestamp } from '../format';
import PostButton from './PostButton';

export default (
	props: {
		article: UserArticle,
		onPost: (article: UserArticle) => void,
		promptMessage: string
	}
) => (
	<ContentBox className="post-prompt_de6v6u">
		{props.article.datePosted ?
			<p>You posted this article on {formatTimestamp(props.article.datePosted)}</p> :
			<p>{props.promptMessage}</p>}
		<PostButton
			article={props.article}
			onPost={props.onPost}
			popoverEnabled={false}
		/>
	</ContentBox>
);