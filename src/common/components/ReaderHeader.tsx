import * as React from 'react';
import UserArticle from '../models/UserArticle';
import Fetchable from '../Fetchable';
import SpinnerIcon from './SpinnerIcon';
import * as classNames from 'classnames';
import Icon from './Icon';

export interface Props {
	article: Fetchable<UserArticle>,
	isHidden: boolean,
	onNavBack?: () => void
}
export default class ReaderHeader extends React.PureComponent<Props> {
	public render() {
		return (
			<div className={classNames('reader-header_h3o6tn', { 'hidden': this.props.isHidden })}>
				<div className="item back">
					{this.props.onNavBack ?
						<Icon
							badge={false}
							name="chevron-left"
							onClick={this.props.onNavBack}
						/> :
						null}
				</div>
				<div className="item progress">
					<div
						className="progress-bar"
					>
						{this.props.article.isLoading ?
							<SpinnerIcon /> :
							this.props.article.value ?
								<>
									<div
										className={classNames('fill', { 'complete': this.props.article.value.isRead })}
										style={{
											transform: `translateY(${100 - this.props.article.value.percentComplete}%)`
										}}
									>
									</div>
									<span className="text">{Math.floor(this.props.article.value.percentComplete) + '%'}</span>
								</> :
								null}
					</div>
				</div>
			</div>
		);
	}
}