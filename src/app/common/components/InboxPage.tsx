import * as React from 'react';
import Fetchable from '../../../common/Fetchable';
import CommentThread from '../../../common/models/CommentThread';
import PageResult from '../../../common/models/PageResult';
import CommentList from '../../../common/components/comments/CommentList';
import PageSelector from './controls/PageSelector';
import LoadingOverlay from './controls/LoadingOverlay';
import ShareChannel from '../../../common/sharing/ShareChannel';
import ShareData from '../../../common/sharing/ShareData';
import UserAccount from '../../../common/models/UserAccount';
import { Screen, SharedState } from './Root';
import ScreenContainer from './ScreenContainer';
import RouteLocation from '../../../common/routing/RouteLocation';

interface Props {
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetReplies: (pageNumber: number, callback: (comments: Fetchable<PageResult<CommentThread>>) => void) => Fetchable<PageResult<CommentThread>>,
	onShare: (data: ShareData) => ShareChannel[],
	onViewThread: (comment: CommentThread) => void,
	user: UserAccount | null
}
export function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'user'>>
) {
	return {
		create: (location: RouteLocation) => ({ key, location, title: 'Inbox' }),
		render: (state: Screen, sharedState: SharedState) => (
			<InboxPage
				{
					...{
						...deps,
						...sharedState
					}
				}
			/>
		)
	};
}
export default class InboxPage extends React.Component<
	Props,
	{ replies: Fetchable<PageResult<CommentThread>> }
> {
	private readonly _updatePageNumber = (pageNumber: number) => {
		this.setState({
			replies: {
				...this.state.replies,
				value: { ...this.state.replies.value, pageNumber },
				isLoading: true
			}
		});
		this.props.onGetReplies(pageNumber, replies => { this.setState({ replies }); });
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			replies: props.onGetReplies(1, replies => { this.setState({ replies }); })
		};
	}
	public render() {
		return (
			<ScreenContainer>
				<div className="inbox-page_b8knhv">
					{this.state.replies.isLoading ?
						<LoadingOverlay /> :
						<>
							<div className="replies">
								{this.state.replies.value ?
									this.state.replies.value.items.length ?
										<CommentList
											comments={this.state.replies.value.items}
											mode="link"
											onCopyTextToClipboard={this.props.onCopyTextToClipboard}
											onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
											onShare={this.props.onShare}
											onViewThread={this.props.onViewThread}
											user={this.props.user}
										/> :
										<span>No replies found. When someone replies to one of your comments it will show up here.</span> :
									null}
							</div>
							<PageSelector
								pageNumber={this.state.replies.value ? this.state.replies.value.pageNumber : 1}
								pageCount={this.state.replies.value ? this.state.replies.value.pageCount : 1}
								onChange={this._updatePageNumber}
								disabled={this.state.replies.isLoading}
							/>
						</>}
				</div>
			</ScreenContainer>
		);
	}
}