import * as React from 'react';
import { AuthorAssignmentRequest, AuthorUnassignmentRequest } from '../../../../common/models/articles/AuthorAssignment';
import { Intent } from '../../../../common/components/Toaster';
import AsyncTracker, { CancellationToken } from '../../../../common/AsyncTracker';
import { getPromiseErrorMessage } from '../../../../common/format';

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
	articleSlug: string,
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
	private readonly _changeArticleSlug = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			articleSlug: event.target.value
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
				if (currentState.isSubmitting) {
					return null;
				}
				let requestPromise: Promise<void>;
				switch (currentState.action) {
					case FormAction.Assign:
						requestPromise = this.props.onAssignAuthorToArticle({
							articleSlug: currentState.articleSlug,
							authorName: currentState.authorReference
						});
						break;
					case FormAction.Unassign:
						requestPromise = this.props.onUnassignAuthorFromArticle({
							articleSlug: currentState.articleSlug,
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
			articleSlug: '',
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
						<span>Article Slug</span>
						<input
							type="text"
							value={this.state.articleSlug}
							onChange={this._changeArticleSlug}
							disabled={this.state.isSubmitting}
						/>
					</label>
					<label>Example: the-new-yorker_the-dead-zone</label>
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
					disabled={!this.state.articleSlug || !this.state.authorReference || this.state.isSubmitting}
					onClick={this._submit}
				>
					{this.state.isSubmitting ? 'Processing...' : 'Submit'}
				</button>
			</form>
		);
	}
}