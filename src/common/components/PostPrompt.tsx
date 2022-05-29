// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

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