import * as React from 'react';
import ContentBox from './ContentBox';
import UserArticle from '../models/UserArticle';
import { formatTimestamp, formatList } from '../format';
import Link from './Link';
import Button from './Button';

export default class PostPrompt extends React.PureComponent<{
	article: UserArticle,
	onPost: (article: UserArticle) => void,
	promptMessage: string
}> {
	private readonly _post = () => {
		this.props.onPost(this.props.article);
	};
	public render() {
		return (
			<ContentBox className="post-prompt_de6v6u">
				{this.props.article.datesPosted.length ?
					<>
						<p>You posted this article on {formatList(this.props.article.datesPosted.map(formatTimestamp))}.</p>
						<Link
							text="Post Again"
							onClick={this._post}
						/>
					</> :
					<>
						<p>{this.props.promptMessage}</p>
						<Button
							intent="success"
							onClick={this._post}
							text="Post"
						/>
					</>}
			</ContentBox>
		);
	}
}