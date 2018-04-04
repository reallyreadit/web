import * as React from 'react';
import UserArticle from '../../../../../common/models/UserArticle';
import Context, { contextTypes } from '../../../Context';
import ReadReadinessDialog, { Error as ReadReadinessError } from './ReadReadinessDialog';
import ArticleDetails from '../../../../../common/components/ArticleDetails';
import { getArticleUrlPath } from '../../../../../common/format';
import ShareArticleDialog from '../../ShareArticleDialog';
import Environment from '../../../Environment';

interface Props {
	article: UserArticle,
	isUserSignedIn: boolean,
	showDeleteControl?: boolean,
	onChange: (article: UserArticle) => void,
	onDelete?: (article: UserArticle) => void
}
export default class extends React.PureComponent<Props, { isStarring: boolean }> {
	public static contextTypes = contextTypes;
	public context: Context;
	private _readArticle = (e: React.MouseEvent<HTMLAnchorElement>) => {
		switch (this.context.environment) {
			case Environment.Browser:
				let error: ReadReadinessError | undefined;
				if (!this.context.extension.isBrowserCompatible()) {
					error = ReadReadinessError.IncompatibleBrowser;
				} else if (!this.context.extension.isInstalled()) {
					error = ReadReadinessError.ExtensionNotInstalled;
				} else if (!this.context.user.isSignedIn) {
					error = ReadReadinessError.SignedOut;
				}
				if (error) {
					e.preventDefault();
					this.context.page.openDialog(React.createElement(ReadReadinessDialog, { error, articleUrl: (e.target as HTMLAnchorElement).href }));
				}
				return;
			case Environment.App:
				e.preventDefault();
				this.context.app.readArticle(this.props.article);
				return;
		}
	};
	private _goToComments = () => {
		this.context.router.history.push(getArticleUrlPath(this.props.article.slug));
	};
	private _toggleStar = () => {
		this.setState({ isStarring: true });
		(this.props.article.dateStarred ?
			this.context.api.unstarArticle(this.props.article.id) :
			this.context.api.starArticle(this.props.article.id))
				.then(() => {
					this.setState({ isStarring: false });
					this.props.onChange({
						...this.props.article,
						dateStarred: this.props.article.dateStarred ? null : new Date().toISOString()
					});
				});
	};
	private _delete = () => this.props.onDelete(this.props.article);
	private _share = () => {
		this.context.page.openDialog(
			React.createElement(
				ShareArticleDialog,
				{ article: this.props.article }
			)
		);
	};
	constructor(props: Props, context: Context) {
		super(props, context);
		this.state = { isStarring: false };
	}
	public render() {
		return (
			<ArticleDetails
				article={this.props.article}
				isUserSignedIn={this.props.isUserSignedIn}
				showDeleteControl={this.props.showDeleteControl}
				isStarring={this.state.isStarring}
				onStar={this._toggleStar}
				onTitleClick={this._readArticle}
				onCommentsClick={this._goToComments}
				onDelete={this._delete}
				onShare={this._share}
			/>
		);
	}
}