import * as React from 'react';
import { AuthorAssignmentRequest, AuthorUnassignmentRequest } from '../../../../common/models/articles/AuthorAssignment';
import { Intent } from '../../../../common/components/Toaster';
import AsyncTracker, { CancellationToken } from '../../../../common/AsyncTracker';
import { getPromiseErrorMessage } from '../../../../common/format';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes, { createArticleSlug } from '../../../../common/routing/routes';
import ScreenKey from '../../../../common/routing/ScreenKey';

enum FormAction {
	Assign = 'Assign',
	Unassign = 'Unassign'
}
interface Props {
	onAssignAuthorToArticle: (request: AuthorAssignmentRequest) => Promise<void>,
	onShowToast: (text: string, intent: Intent) => void,
	onUnassignAuthorFromArticle: (request: AuthorUnassignmentRequest) => Promise<void>
}
interface State {
	action: FormAction,
	articleReference: string,
	authorReference: string,
	isSubmitting: boolean
}
export class ArticleAuthorControl extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeAction = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			action: event.target.value as FormAction
		});
	};
	private readonly _changeArticleReference = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			articleReference: event.target.value
		});
	};
	private readonly _changeAuthorReference = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			authorReference: event.target.value
		});
	};
	private readonly _submit = () => {
		this.setState(
			currentState => {
				// Make sure we're not already submitting.
				if (currentState.isSubmitting) {
					return null;
				}
				// Validate article reference.
				let articleSlug = currentState.articleReference;
				if (
					/^https?:/.test(articleSlug)
				) {
					try {
						const
							articleUrl = new URL(articleSlug),
							params = findRouteByKey(routes, ScreenKey.Comments)
								.getPathParams(articleUrl.pathname);
						if (!params['sourceSlug'] || !params['articleSlug']) {
							this.props.onShowToast('Invalid comments URL.', Intent.Danger);
							return null;
						}
						articleSlug = createArticleSlug(params);
					} catch {
						this.props.onShowToast('Invalid URL.', Intent.Danger);
						return null;
					}
				}
				// Submit request.
				let requestPromise: Promise<void>;
				switch (currentState.action) {
					case FormAction.Assign:
						requestPromise = this.props.onAssignAuthorToArticle({
							articleSlug,
							authorName: currentState.authorReference
						});
						break;
					case FormAction.Unassign:
						requestPromise = this.props.onUnassignAuthorFromArticle({
							articleSlug,
							authorSlug: currentState.authorReference
						});
						break;
				}
				this._asyncTracker
					.addPromise(requestPromise)
					.then(
						() => {
							this.props.onShowToast('Action succeeded.', Intent.Success);
							this.setState({
								isSubmitting: false
							});
						}
					)
					.catch(
						reason => {
							if ((reason as CancellationToken)?.isCancelled) {
								return;
							}
							this.props.onShowToast(
								getPromiseErrorMessage(reason),
								Intent.Danger
							);
							this.setState({
								isSubmitting: false
							});
						}
					);
				return {
					isSubmitting: true
				};
			}
		);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			action: FormAction.Assign,
			articleReference: '',
			authorReference: '',
			isSubmitting: false
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		let
			authorReferenceLabelText: string,
			authorReferenceExampleText: string;
		switch (this.state.action) {
			case FormAction.Assign:
				authorReferenceLabelText = 'Author Name';
				authorReferenceExampleText = 'Malcolm Gladwell';
				break;
			case FormAction.Unassign:
				authorReferenceLabelText = 'Author Slug';
				authorReferenceExampleText = 'malcolm-gladwell';
				break
		}
		return (
			<form className="article-author-control_r2vdzx">
				<fieldset>
					<legend>Article Author Assignment</legend>
					<label>
						<input
							type="radio"
							value={FormAction.Assign}
							checked={this.state.action === FormAction.Assign}
							onChange={this._changeAction}
							disabled={this.state.isSubmitting}
						/>
						<span>Assign to Article</span>
					</label>
					<label>
						<input
							type="radio"
							value={FormAction.Unassign}
							checked={this.state.action === FormAction.Unassign}
							onChange={this._changeAction}
							disabled={this.state.isSubmitting}
						/>
						<span>Unassign from Article</span>
					</label>
					{this.state.action === FormAction.Unassign ?
						<label>*** Warning: This action cannot be undone. ***</label> :
						null}
					<label>
						<span>Article Slug OR URL</span>
						<input
							type="text"
							value={this.state.articleReference}
							onChange={this._changeArticleReference}
							disabled={this.state.isSubmitting}
						/>
					</label>
					<label>Example: the-new-yorker_the-dead-zone OR https://readup.com/comments/the-new-yorker/the-dead-zone</label>
					<label>
						<span>{authorReferenceLabelText}</span>
						<input
							type="text"
							value={this.state.authorReference}
							onChange={this._changeAuthorReference}
							disabled={this.state.isSubmitting}
						/>
					</label>
					<label>Example: {authorReferenceExampleText}</label>
				</fieldset>
				<button
					disabled={!this.state.articleReference || !this.state.authorReference || this.state.isSubmitting}
					onClick={this._submit}
				>
					{this.state.isSubmitting ? 'Processing...' : 'Submit'}
				</button>
			</form>
		);
	}
}