import * as React from 'react';
import * as className from 'classnames';
import UserArticle from '../models/UserArticle';

export default (props: { article: UserArticle }) =>
	<span className={className('percent-complete-indicator', { 'unlocked': props.article.isRead })}>
		Percent Complete: {props.article.percentComplete.toFixed() + '%'}
	</span>;