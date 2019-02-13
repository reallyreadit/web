import * as React from 'react';
import Fetchable from '../../../common/Fetchable';
import Comment from '../../../common/models/Comment';
import PageResult from '../../../common/models/PageResult';
import CommentList from './controls/comments/CommentList';
import PageSelector from './controls/PageSelector';
import LoadingOverlay from './controls/LoadingOverlay';

interface Props {
	onGetReplies: (pageNumber: number, callback: (comments: Fetchable<PageResult<Comment>>) => void) => Fetchable<PageResult<Comment>>,
	onViewThread: (comment: Comment) => void
}
export function createScreenFactory<TScreenKey>(key: TScreenKey, deps: Props) {
	return {
		create: () => ({ key, title: 'Inbox' }),
		render: () => (
			<InboxPage {...deps} />
		)
	};
}
export default class InboxPage extends React.Component<
	Props,
	{ replies: Fetchable<PageResult<Comment>> }
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
										onViewThread={this.props.onViewThread}
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
		);
	}
}