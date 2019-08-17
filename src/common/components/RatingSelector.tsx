import * as React from 'react';
import classNames from 'classnames';
import ShareControl, { MenuPosition } from './ShareControl';
import ActionLink from './ActionLink';
import ShareData from '../sharing/ShareData';
import ShareChannel from '../sharing/ShareChannel';
import UserArticle from '../models/UserArticle';
import getShareData from '../sharing/getShareData';
import ContentBox from './ContentBox';

interface Props {
	article: UserArticle,
	autoHideStatusText?: boolean,
	children?: React.ReactNode,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onSelectRating: (rating: number) => Promise<{}>,
	onShare: (data: ShareData) => ShareChannel[]
}
export default class extends React.PureComponent<
	Props,
	{ isSelectingRating: boolean }
> {
	public static defaultProps: Partial<Props> = {
		autoHideStatusText: true
	};
	private readonly _getShareData = () => {
		return getShareData(
			this.props.article,
			this.props.onCreateAbsoluteUrl
		);
	};
	private readonly _selectRating = (event: React.MouseEvent<HTMLButtonElement>) => {
		let score: number | null;
		if (
			!event.currentTarget.disabled &&
			(
				(score = parseInt(event.currentTarget.value)) !== this.props.article.ratingScore
			)
		) {
			this.setState({ isSelectingRating: true });
			this.props
				.onSelectRating(score)
				.then(() => {
					this.setState({ isSelectingRating: false });
				});
		}
	};
	constructor(props: Props) {
		super(props);
		this.state = { isSelectingRating: false };
	}
	public render() {
		return (
			<ContentBox className="rating-selector_epcgq9">
				{this.props.children}
				<div className="prompt-text">
					<strong>Would you recommend this article to others?</strong>
				</div>
				<div className="rating-bar">
					<label>No</label>
					<div className="buttons">
						{Array
							.from(new Array(10))
							.map((e, i) => {
								const value = i + 1;
								return (
									<button
										className={classNames(
											'rating-button',
											{ 'selected': value === this.props.article.ratingScore }
										)}
										disabled={this.state.isSelectingRating}
										key={i}
										onClick={this._selectRating}
										value={value}
									>
										{value}
									</button>
								);
							})}
					</div>
					<label>Yes</label>
				</div>
				<div className={
					classNames(
						'status-text',
						this.props.autoHideStatusText &&
						!this.state.isSelectingRating &&
						this.props.article.ratingScore == null ?
							'hidden' :
							null
					)
				}>
					{this.state.isSelectingRating ?
						'Saving rating...' :
						this.props.article.ratingScore != null ?
							this.props.article.ratingScore >= 8 ?
								<>
									Awesome.&nbsp;
									<ShareControl
											menuPosition={MenuPosition.TopCenter}
											onCopyTextToClipboard={this.props.onCopyTextToClipboard}
											onGetData={this._getShareData}
											onShare={this.props.onShare}
										>
											<ActionLink text="Share it" />
										</ShareControl>
										&nbsp;widely!
								</> :
								'Thanks for your feedback.' :
							<>&nbsp;</>}
				</div>
			</ContentBox>
		);
	}
}