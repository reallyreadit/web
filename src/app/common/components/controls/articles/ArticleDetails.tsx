import * as React from 'react';
import UserArticle from '../../../../../common/models/UserArticle';
import Context, { contextTypes } from '../../../Context';
import ReadReadinessDialog from './ReadReadinessDialog';
import ArticleDetails from '../../../../../common/components/ArticleDetails';
import { getArticleUrlPath } from '../../../../../common/format';
import ShareArticleDialog from '../../ShareArticleDialog';

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
	private _checkReadReadiness = (e: React.MouseEvent<HTMLAnchorElement>) => {
		let reason: 'incompatibleBrowser' | 'extensionNotInstalled' | 'signedOut';
		if (!this.context.extension.isBrowserCompatible()) {
			reason = 'incompatibleBrowser';
		} else if (!this.context.extension.isInstalled()) {
			reason = 'extensionNotInstalled';
		} else if (!this.context.user.isSignedIn) {
			reason = 'signedOut';
		}
		if (reason) {
			e.preventDefault();
			this.context.page.openDialog(React.createElement(ReadReadinessDialog, { reason, articleUrl: (e.target as HTMLAnchorElement).href }));
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
				onTitleClick={this._checkReadReadiness}
				onCommentsClick={this._goToComments}
				onDelete={this._delete}
				onShare={this._share}
			/>
		);
	}
}