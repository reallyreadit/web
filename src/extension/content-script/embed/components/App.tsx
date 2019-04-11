import * as React from 'react';
import IframeMessagingContext from '../IframeMessagingContext';
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
import Rating from '../../../../common/models/Rating';

interface Props {
	contentScript: IframeMessagingContext
}
export default class App extends React.Component<
	Props,
	{
		article?: UserArticle
		toasts: Toast[]
	}
> {
	// articles
	private readonly _rateArticle = (rating: number) => {
		return new Promise((resolve, reject) => {
			this.props.contentScript.sendMessage(
				{
					type: 'rateArticle',
					data: rating
				},
				(rating: Rating) => {
					if (rating) {
						this.setState({
							article: {
								...this.state.article,
								ratingScore: rating.score
							}
						});
						resolve();
					} else {
						reject();
					}
				}
			);
		});
	};

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
		props.contentScript.addListener((message, sendResponse) => {
			switch (message.type) {
				case 'updateArticle':
					this.setState({ article: message.data });
					break;
			}
		});
	}
	public render() {
		return (
			<div className="app_5ii7ja">
				{this.state.article ?
					<Footer
						article={this.state.article}
						children={<Logo />}
						onCopyTextToClipboard={this._clipboard.copyText}
						onCreateAbsoluteUrl={this._createAbsoluteUrl}
						onSelectRating={this._rateArticle}
						onShare={this._handleShareRequest}
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