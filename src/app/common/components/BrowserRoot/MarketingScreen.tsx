import * as React from 'react';
import Button from './Button';
import Spinner from './Spinner';
import Footer from './Footer';

interface Props {
	isDesktopDevice: boolean,
	isIosDevice: boolean | null,
	isUserSignedIn: boolean,
	onCopyAppReferrerTextToClipboard: () => void,
	onInstallExtension: () => void,
	onOpenCreateAccountDialog: () => void,
	onViewPrivacyPolicy: () => void
} 
export default class MarketingScreen extends React.PureComponent<Props> {
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
							<h1>Make yourself a better reader.</h1>
							<h3>Tools you need to track and improve your online reading habits and improve your focus.</h3>
							{button}
							{this.props.isDesktopDevice || this.props.isIosDevice === false ?
								<div className="platforms">
									<span className="text">Available on iOS and Chrome</span>
									<div className="badges">
										<a href="https://itunes.apple.com/us/app/reallyread-it/id1441825432">
											<img src="/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg" alt="App Store Badge" />
										</a>
										<a onClick={this.props.onInstallExtension}>
											<img src="/images/ChromeWebStore_BadgeWBorder.svg" alt="Chrome Web Store Badge" />
										</a>
									</div>
								</div> :
								null}
						</div>
					</div>
					<div className="section">
						<div className="content">
							<h2>Fight the urge to skim.</h2>
							<p>See what happens if you read every single word of these three paragraphs. Off the bat, it might not seem challenging. You might even find yourself enjoying the rhythm of a particularly long sentence, like this one, that revs up with a bright, simple idea and then before you know it - bam! - some ominous image begins creepy-crawling into your mind’s eye, complicating things, and suddenly you wonder what you’re doing here. What <em>are</em> you doing here?</p>
							<p>The answer to that question has something to do with a belief in the inherent value of focus. You know you could skip ahead, but then you’d miss the point. When the brain skims text, it can’t grasp complexity, nuance, beauty. On the other hand, when neuroscientists scan the brain in the act of reading deeply, they see fireworks: critical thinking, empathy, creativity, short- and long-term memory, all kinds of random stuff from your childhood. Reading unlocks everything. No wonder it makes you smarter, happier, healthier, and even more successful in your career. It’s the most effective way to transform information into knowledge and wisdom.</p>
							<p>There’s a widespread misperception that you learn to read as a kid and that’s that. In reality, reading is more like exercise, a lifelong practice, a skill that must be maintained and can always be improved. Readup is a community of people who believe in a moonshot idea: that reading can revitalize the internet, make it more sane, more human. We believe this because we experience it, every day, in all its glory: the meditation, the escape, the joy. Three paragraphs of text probably didn’t change your life. But wouldn’t it be crazy if it did?</p>
						</div>
					</div>
					<div className="section">
						<div className="content">
							<h2>How it works</h2>
							<ol>
								<li>
									<img src="/images/certificate.svg" />
									<span>Get credit for reading things fully.</span>
								</li>
								<li>
									<img src="/images/projector-screen-chart.svg" />
									<span>Track and improve your performance over time.</span>
								</li>
								<li>
									<img src="/images/stairs.svg" />
									<span>Go on a streak by reading a full article every day.</span>
								</li>
								<li>
									<img src="/images/priority-increase.svg" />
									<span>Vote with your attention. Reads are like upvotes.</span>
								</li>
								<li>
									<img src="/images/robot-arm.svg" />
									<span>Exceptional articles and stories thanks to exceptional data.</span>
								</li>
								<li>
									<img src="/images/read.svg" />
									<span>No ads. No links. 100% distraction-free. (iOS app only. Chrome soon!)</span>
								</li>
								<li>
									<img src="/images/bubble-emoji.svg" />
									<span>Earn the right to comment on an article by reading it fully.</span>
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
							<p>“I’m really enjoying being a user!” <em>-Aram, Director, Ad Tech, Washington Post</em></p>
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