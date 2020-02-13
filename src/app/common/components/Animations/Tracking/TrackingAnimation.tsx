import * as React from 'react';
import Reader from './Reader';
import ArticleDetails from './ArticleDetails';
import PointsCounter from './PointsCounter';
import Clock from './Clock';
import classNames from 'classnames';
import AnimationPlayState from '../AnimationPlayState';

interface Props {
	onFinished?: () => void,
	onPlay?: () => void
}
export default class TrackingAnimation extends React.PureComponent<
	Props,
	{
		hasFinished: boolean,
		playState: AnimationPlayState
	}
> {
	private readonly _handleArticle3AnimationEnd = (event: React.AnimationEvent) => {
		if (event.animationName === 'article-details_brocy1-article-3') {
			setTimeout(
				() => {
					this.setState(
						{
							hasFinished: true,
							playState: AnimationPlayState.Finished
						},
						this.props.onFinished
					);
				},
				1000
			);
		}
	};
	private readonly _play = () => {
		if (this.state.playState !== AnimationPlayState.Playing) {
			this.setState(
				{
					playState: AnimationPlayState.Playing
				},
				this.props.onPlay
			);
		}
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			hasFinished: false,
			playState: AnimationPlayState.Unstarted
		};
	}
	public render() {
		return (
			<div
				className={
					classNames(
						'tracking-animation_s8r7bq',
						this.state.playState,
						{ 'initial': !this.state.hasFinished }
					)
				}
			>
				<div className="viewport">
					<div className="articles-frame">
						<div className="title">Article of the Day</div>
						<div className="articles">
							<ArticleDetails
								playState={this.state.playState}
								position={1}
							/>
							<div className="separator"></div>
							<ArticleDetails
								playState={this.state.playState}
								position={2}
							/>
							<ArticleDetails
								onAnimationEnd={this._handleArticle3AnimationEnd}
								playState={this.state.playState}
								position={3}
							>
								<PointsCounter playState={this.state.playState} />
							</ArticleDetails>
							<ArticleDetails
								playState={this.state.playState}
								position={4}
							/>
							<ArticleDetails
								playState={this.state.playState}
								position={5}
							/>
							<ArticleDetails
								playState={this.state.playState}
								position={6}
							/>
						</div>
						<Clock playState={this.state.playState} />
					</div>
					<div className="readers-frame">
						<div className="readers">
							<div className="row">
								<Reader
									playState={this.state.playState}
									position={1}
								/>
								<Reader
									playState={this.state.playState}
									position={2}
								/>
								<Reader
									playState={this.state.playState}
									position={3}
								/>
							</div>
							<div className="row">
								<Reader
									playState={this.state.playState}
									position={4}	
								/>
								<Reader
									playState={this.state.playState}
									position={5}
								/>
								<Reader
									playState={this.state.playState}
									position={6}
								/>
							</div>
							<div className="row">
								<Reader 
									playState={this.state.playState}
									position={7}
								/>
								<Reader
									playState={this.state.playState}
									position={8}
								/>
								<Reader
									playState={this.state.playState}
									position={9}
								/>
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
					<div
						className="play-button"
						onClick={this._play}
					></div>
				</div>
				<ol className="captions">
					<li className="caption">To understand how Readup works, enjoy this 30-second animation.</li>
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