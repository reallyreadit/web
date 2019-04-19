import * as React from 'react';
import Footer from '../../../../common/components/reader/Footer';
import ShareChannel from '../../../../common/sharing/ShareChannel';
import ClipboardTextInput from '../../../../common/components/ClipboardTextInput';
import Toaster, { Toast } from '../../../../common/components/Toaster';
import ClipboardService from '../../../../common/services/ClipboardService';
import { createUrl } from '../../../../common/HttpEndpoint';
import ToasterService, { State as ToasterState } from '../../../../common/services/ToasterService';
import AsyncTracker from '../../../../common/AsyncTracker';
import UserArticle from '../../../../common/models/UserArticle';
import Logo from './Logo';
import Fetchable from '../../../../common/Fetchable';
import CommentThread from '../../../../common/models/CommentThread';
import UserAccount from '../../../../common/models/UserAccount';

export interface Props {
	article?: UserArticle
	comments?: Fetchable<CommentThread[]>,
	onPostComment: (text: string, articleId: number, parentCommentId?: string) => Promise<void>,
	onSelectRating: (rating: number) => Promise<{}>,
	user?: UserAccount
}
export default class App extends React.Component<
	Props,
	{ toasts: Toast[] }
> {
	// clipboard
	private readonly _clipboard = new ClipboardService(
		(content, intent) => {
			this._toaster.addToast(content, intent);
		}
	);

	// routing
	private readonly _createAbsoluteUrl = (path: string) => createUrl(window.reallyreadit.extension.config.web, path);

	// sharing
	private readonly _handleShareRequest = () => {
		return [
			ShareChannel.Clipboard,
			ShareChannel.Email,
			ShareChannel.Twitter
		];
	};

	// toasts
	private readonly _toaster = new ToasterService({
		asyncTracker: new AsyncTracker(),
		setState: (state: (prevState: ToasterState) => Pick<ToasterState, keyof ToasterState>) => {
			this.setState(state);
		}
	});
	constructor(props: Props) {
		super(props);
		this.state = {
			toasts: []
		};
	}
	public render() {
		return (
			<div className="app_5ii7ja">
				{this.props.article ?
					<Footer
						article={this.props.article}
						autoHideRatingSelectorStatusText={false}
						comments={this.props.comments}
						children={<Logo />}
						onCopyTextToClipboard={this._clipboard.copyText}
						onCreateAbsoluteUrl={this._createAbsoluteUrl}
						onPostComment={this.props.onPostComment}
						onSelectRating={this.props.onSelectRating}
						onShare={this._handleShareRequest}
						user={this.props.user}
					/> :
					null}
				<Toaster
					onRemoveToast={this._toaster.removeToast}
					toasts={this.state.toasts}
				/>
				<ClipboardTextInput onSetRef={this._clipboard.setTextInputRef} />
			</div>
		);
	}
}