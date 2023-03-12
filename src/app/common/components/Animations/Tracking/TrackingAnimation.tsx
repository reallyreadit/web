// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as React from 'react';
import Reader from './Reader';
import ArticleDetails from './ArticleDetails';
import PointsCounter from './PointsCounter';
import Clock from './Clock';
import classNames from 'classnames';
import AnimationPlayState from '../AnimationPlayState';
import AsyncTracker from '../../../../../common/AsyncTracker';

interface Props {
	autoPlay?: boolean;
	onFinished?: () => void;
	onPlay?: () => void;
}
export default class TrackingAnimation extends React.PureComponent<
	Props,
	{
		autoPlay: boolean;
		hasFinished: boolean;
		playState: AnimationPlayState;
	}
> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _elementRef: React.RefObject<HTMLDivElement>;
	private readonly _handleArticle3AnimationEnd = (
		event: React.AnimationEvent
	) => {
		if (event.animationName === 'article-details_brocy1-article-3') {
			this._asyncTracker.addTimeout(
				window.setTimeout(() => {
					this.setState(
						{
							hasFinished: true,
							playState: AnimationPlayState.Finished,
						},
						this.props.onFinished
					);
				}, 1000)
			);
		}
	};
	private _intersectionObserver: IntersectionObserver;
	private readonly _play = () => {
		if (this.state.playState !== AnimationPlayState.Playing) {
			this.setState(
				{
					playState: AnimationPlayState.Playing,
				},
				this.props.onPlay
			);
		}
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			autoPlay: props.autoPlay || false,
			hasFinished: false,
			playState: AnimationPlayState.Unstarted,
		};
		if (props.autoPlay) {
			this._elementRef = React.createRef();
		}
	}
	public componentDidMount() {
		if (this.props.autoPlay) {
			// iOS 11 WKWebView doesn't support IntersectionObserver
			if ('IntersectionObserver' in window) {
				this._intersectionObserver = new IntersectionObserver(
					(entries) => {
						const entry = entries[0];
						if (entry && entry.isIntersecting) {
							this._play();
							this._intersectionObserver.unobserve(entry.target);
						}
					},
					{
						threshold: 1,
					}
				);
				this._intersectionObserver.observe(this._elementRef.current);
			} else {
				this.setState({
					autoPlay: false,
				});
			}
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
		if (this._intersectionObserver) {
			this._intersectionObserver.disconnect();
		}
	}
	public render() {
		return (
			<div
				className={classNames(
					'tracking-animation_s8r7bq',
					this.state.playState,
					{
						'auto-play': this.state.autoPlay,
						initial: !this.state.hasFinished,
					}
				)}
				ref={this._elementRef}
			>
				<div className="viewport">
					<div className="articles-frame">
						<div className="title">Article of the Day</div>
						<div className="articles">
							<ArticleDetails playState={this.state.playState} position={1} />
							<div className="separator"></div>
							<ArticleDetails playState={this.state.playState} position={2} />
							<ArticleDetails
								onAnimationEnd={this._handleArticle3AnimationEnd}
								playState={this.state.playState}
								position={3}
							>
								<PointsCounter playState={this.state.playState} />
							</ArticleDetails>
							<ArticleDetails playState={this.state.playState} position={4} />
							<ArticleDetails playState={this.state.playState} position={5} />
							<ArticleDetails playState={this.state.playState} position={6} />
						</div>
						<Clock playState={this.state.playState} />
					</div>
					<div className="readers-frame">
						<div className="readers">
							<div className="row">
								<Reader playState={this.state.playState} position={1} />
								<Reader playState={this.state.playState} position={2} />
								<Reader playState={this.state.playState} position={3} />
							</div>
							<div className="row">
								<Reader playState={this.state.playState} position={4} />
								<Reader playState={this.state.playState} position={5} />
								<Reader playState={this.state.playState} position={6} />
							</div>
							<div className="row">
								<Reader playState={this.state.playState} position={7} />
								<Reader playState={this.state.playState} position={8} />
								<Reader playState={this.state.playState} position={9} />
							</div>
						</div>
					</div>
					<div className="highlighters">
						<div className="highlighter n-1"></div>
						<div className="highlighter n-2"></div>
						<div className="highlighter n-3"></div>
						<div className="highlighter n-4"></div>
						<div className="highlighter n-5"></div>
					</div>
					<div className="play-button" onClick={this._play}></div>
				</div>
				<ol className="captions">
					<li className="caption">
						To understand how Readup curates articles, enjoy this 30-second
						animation.
					</li>
					<li className="caption">Reading requires focus.</li>
					<li className="caption">Readup helps you finish.</li>
					<li className="caption">Readup is a community. </li>
					<li className="caption">We vote with our attention.</li>
					<li className="caption">Every midnight, we have another winner!</li>
				</ol>
			</div>
		);
	}
}
