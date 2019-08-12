import * as React from 'react';
import Button from './Button';
import Spinner from './Spinner';
import Footer from './Footer';
import Icon from '../../../../common/components/Icon';

interface Props {
	isDesktopDevice: boolean,
	isIosDevice: boolean | null,
	isUserSignedIn: boolean,
	onCopyAppReferrerTextToClipboard: () => void,
	onInstallExtension: () => void,
	onOpenCreateAccountDialog: () => void,
	onViewPrivacyPolicy: () => void,
	variant: number
}
export const variants: {
	[key: number]: string
} = {
	1: 'Make yourself a better reader.',
	2: 'Read with friends.',
	3: 'Social media for people who read.'
};
export default class MarketingScreen extends React.PureComponent<Props> {
	private readonly _secondSectionElementRef: React.RefObject<HTMLDivElement>;
	private readonly _scrollDown = () => {
		this._secondSectionElementRef.current.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
	};
	constructor(props: Props) {
		super(props);
		this._secondSectionElementRef = React.createRef();
	}
	public render () {
		if (
			this.props.isDesktopDevice ||
			this.props.isIosDevice ||
			(this.props.isIosDevice === false && !this.props.isUserSignedIn)
		) {
			let button: React.ReactNode;
			if (this.props.isIosDevice) {
				button = (
					<a
						className="download-app-button"
						href="https://itunes.apple.com/us/app/reallyread-it/id1441825432"
						onClick={this.props.onCopyAppReferrerTextToClipboard}
					>
						<img src="/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg" alt="App Store Badge" />
					</a>
				);
			} else {
				button = (
					<Button
						style="loud"
						onClick={this.props.onOpenCreateAccountDialog}
					>
						Get Started
					</Button>
				);
			}
			return (
				<div className="marketing-screen_n5a6wc">
					<div className="section">
						<div className="content">
							<h1>{variants[this.props.variant]}</h1>
							{button}
							{this.props.isDesktopDevice || this.props.isIosDevice === false ?
								<div className="platforms">
									<span className="text">Available on iOS and Chrome</span>
									<div className="badges">
										<a
											href="https://itunes.apple.com/us/app/reallyread-it/id1441825432"
											target="_blank"
										>
											<img src="/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg" alt="App Store Badge" />
										</a>
										<a onClick={this.props.onInstallExtension}>
											<img src="/images/ChromeWebStore_BadgeWBorder.svg" alt="Chrome Web Store Badge" />
										</a>
									</div>
								</div> :
								null}
						</div>
						<div className="read-more">
							<Icon
								className="icon"
								name="chevron-down"
								onClick={this._scrollDown}
							/>
						</div>
					</div>
					<div
						className="section"
						ref={this._secondSectionElementRef}
					>
						<div className="content">
							<h2>What is Readup?</h2>
							<p>Readup is a reading platform that incentivizes thoughtful, deep reading of the world's best free content. We are a community that believes in a moonshot idea: that reading can revitalize the internet, make it more sane, more human.</p>
						</div>
					</div>
					<div className="section">
						<div className="content">
							<h2>How it works</h2>
							<ol>
								<li>
									<img src="/images/read.svg" />
									<span>Read anything you want without distractions. No ads. No links.</span>
								</li>
								<li>
									<img src="/images/projector-screen-chart.svg" />
									<span>Track and improve your online reading habits.</span>
								</li>
								<li>
									<img src="/images/bubble-emoji.svg" />
									<span>Have conversations with others about articles you've read.</span>
								</li>
								<li>
									<img src="/images/priority-increase.svg" />
									<span>Vote with your attention. Reads are like "upvotes" or "likes."</span>
								</li>
								<li>
									<img src="/images/group-circle.svg" />
									<span>A community of readers creating a better web for everyone.</span>
								</li>
							</ol>
						</div>
					</div>
					<div className="section community">
						<div className="content">
							<h2>From the community</h2>
							<p>“Reading the articles has opened me in a way that is exciting and expansive. I love the quality of the selections, the community - the ease of use. This is VERY important, especially given all the evidence recently that people are having a really difficult time even being able to read, to have the ability to concentrate, to focus, to care what the hell they are even putting in their minds! I am SUCH a HUGE fan and grateful for this app.” <em>-Pegeen</em></p>
							<p>“WOW. This content is crazy good.” <em>-Natalie</em></p>
							<p>“From a mindfulness perspective, I enjoy seeing how much my monkey mind tries to make me skip sections and how good a practice it is to stick with it anyway.” <em>-Leo</em></p>
							<p>“I love how thoughtful the comments are.” <em>-Crystal Hana Kim, novelist.</em></p>
							{button}
						</div>
					</div>
					<Footer
						onViewPrivacyPolicy={this.props.onViewPrivacyPolicy}
					/>
				</div>
			);
		}
		if (this.props.isIosDevice == null) {
			return (
				<div className="marketing-screen_n5a6wc loading">
					<Spinner />
				</div>
			);
		}
		return (
			<div className="marketing-screen_n5a6wc unsupported">
				<div className="prompt">
					<span className="text">Get Readup on iOS and Chrome</span>
					<div className="badges">
						<a href="https://itunes.apple.com/us/app/reallyread-it/id1441825432">
							<img src="/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg" alt="App Store Badge" />
						</a>
						<a onClick={this.props.onInstallExtension}>
							<img src="/images/ChromeWebStore_BadgeWBorder.svg" alt="Chrome Web Store Badge" />
						</a>
					</div>
				</div>
				<Footer
					onViewPrivacyPolicy={this.props.onViewPrivacyPolicy}
				/>
			</div>
		);
	}
}