import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Context, { contextTypes } from '../Context';
import SignInDialog from './SignInDialog';
import CreateAccountDialog from './CreateAccountDialog';
import readingIllustration from '../svg/readingIllustration';

declare var Snap: any;

export default class HowItWorksPage extends React.PureComponent<RouteComponentProps<{}>, {}> {
	public static contextTypes = contextTypes;
	public context: Context;
	private readonly _forceUpdate = () => this.forceUpdate();
	private _installExtension = (e: React.MouseEvent<HTMLAnchorElement>) => chrome.webstore.install();
	private _showSignInDialog = () => this.context.page.openDialog(React.createElement(SignInDialog));
	private _showCreateAccountDialog = () => this.context.page.openDialog(React.createElement(CreateAccountDialog));
	private _animationTimeout: number;
	private _animationResetTimeout: number;
	public componentWillMount() {
		this.context.page.setState({
			title: 'How It Works',
			isLoading: false,
			isReloadable: false
		});
	}
	public componentDidMount() {
		// event handlers
		this.context.user.addListener('authChange', this._forceUpdate);
		this.context.extension.addListener('change', this._forceUpdate);
		// animation
		// - setup
		const s = Snap('#reading-illustration');
		// - snap
		const bubbleGradient = s.gradient('l(0.5, 0, 0.5, 1)white:100-pink:100');
		const bubbleGradientStops = bubbleGradient
			.stops()
			.attr({ offset: 1 });
		// - svg
		const badges = s.selectAll('.badge');
		const bubbles = s.selectAll('.bubble');
		const viewPort = s.select('.view-port');
		const scrollHandle = s.select('.scroll-handle');
		const content = s.select('.content');
		// - loop
		const self = this;
		function animateReading() {
			Snap
				.set(viewPort, scrollHandle, content, bubbleGradientStops)
				.animate(
					[{ transform: 't0,220' }, 4000],
					[{ transform: 't0,151' }, 4000],
					[{ transform: 't0,-220' }, 4000],
					[
						{ offset: 0 },
						4000,
						() => {
							// final state
							bubbles.attr({ fill: 'palegreen' });
							// pause
							self._animationTimeout = window.setTimeout(
								() => {
									// reset
									viewPort.attr({ transform: 't0,0' });
									scrollHandle.attr({ transform: 't0,0' });
									content.attr({ transform: 't0,0' });
									bubbleGradientStops.attr({ offset: 1 });
									bubbles.attr({ fill: bubbleGradient });
									// go again
									self._animationResetTimeout = window.setTimeout(animateReading, 1000);
								},
								3000
							);
						}
					]
				);
		}
		bubbles.attr({ fill: bubbleGradient });
		badges
			.attr({ transform: 's0,0' })
			.animate(
				{ transform: 's1.25,1.25' },
				400,
				() => (badges as any).animate(
					{ transform: 's1,1' },
					125,
					animateReading
				)
			);
	}
	public componentWillUnmount() {
		// event handlers
		this.context.user.removeListener('authChange', this._forceUpdate);
		this.context.extension.removeListener('change', this._forceUpdate);
		// animation
		window.clearTimeout(this._animationTimeout);
		window.clearTimeout(this._animationResetTimeout);
	}
	public render() {
		return (
			<div className="how-it-works-page copy-page">
				{this.context.extension.isInstalled() ?
					<p>First, add the Chrome extension. (You only have to do this once.)</p> :
					<p>First, <a onClick={this._installExtension}>add the Chrome extension</a>. (You only have to do this once.)</p>}
				{this.context.user.isSignedIn ?
					<p>Next, sign in or create an account.</p> :
					<p>Next, <a onClick={this._showSignInDialog}>sign in</a> or <a onClick={this._showCreateAccountDialog}>create an account</a>.</p>}
				<p>
					Great! Now you can read anything, anywhere on the internet and get credit for articles and stories you finish.
				</p>
				<div className="animated-illustration" dangerouslySetInnerHTML={{ __html: readingIllustration }}></div>
				<p>
					Track your reading progress with our handy browser icon.
				</p>
				<p>
					Don't skim or skip ahead - you won't get credit. 
				</p>
				<p>
					The icon is also a button. Use it to star articles for later and to navigate between articles and their comments sections on our site.
				</p>
				<p>
					More questions? Check out the <a href="http://blog.reallyread.it/beta/2017/07/12/FAQ.html">FAQ</a>.
				</p>
			</div>
		);
	}
}