import * as React from 'react';
import ContextComponent from '../ContextComponent';
import Context from '../Context';
import UserArticle from '../api/models/UserArticle';
import Fetchable from '../api/Fetchable';

export default class MyAccount extends ContextComponent<{}, { articles: Fetchable<UserArticle[]> }> {
	constructor(props: {}, context: Context) {
		super(props, context);
		this.state = {
			articles: this.context.api.listUserArticles(articles => this.setState({ articles }))
		};
	}
	public refresh() {
		this.setState({
			articles: this.context.api.listUserArticles(articles => this.setState({ articles }))
		});
	}
	public componentWillMount() {
		this.context.pageTitle.set('My Account');
	}
	public render() {
		return (
			<div className="my-account">
				<h3>My Articles</h3>
				<ul>
				{this.state.articles.isLoading ?
					<li>Loading...</li> :
					this.state.articles.isSuccessful ?
						this.state.articles.value.length > 0 ?
							this.state.articles.value.map(article =>
								<li key={article.id}>
									<span className="title">{article.title}</span><br />
									<span className="percent-complete">Percent Complete: {article.percentComplete}%</span>
								</li>) :
							<li>No articles found! (Go read one!)</li> :
						<li>Error loading articles for user.</li>}
				</ul>
			</div>
		);
	}
}