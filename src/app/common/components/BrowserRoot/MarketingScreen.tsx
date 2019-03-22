import * as React from 'react';
import Button from './Button';
import Footer from './Footer';

export default (
	props: {
		onOpenCreateAccountDialog: () => void,
		onViewPrivacyPolicy: () => void
	}
) => (
	<div className="marketing-screen_n5a6wc">
		<div className="section">
			<h1>Make yourself a better reader.</h1>
			<Button
				style="loud"
				onClick={props.onOpenCreateAccountDialog}
			>
				Get Started
			</Button>
		</div>
		<div className="section">
			<h2>Read better. Read more.</h2>
			<p>Reading feeds the soul. It allows us to escape to new worlds and explore new ideas. It’s directly linked to intelligence and success. And above all else, it’s fun. Unfortunately, on the web, it’s hard to avoid skimming and scanning, and these activities don’t confer the same benefits as deep, focused reading.</p>
			<p>The good news is that it’s never too late to develop a reading habit. Just like any form of exercise, the more you do it the better you’ll get. And as you improve, you’ll have more and more fun. Readup is a community of readers and we’d love to have you on board. Get started right now!</p>
		</div>
		<div className="section">
			<h2>Social media powered by reading.</h2>
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
					<span>You vote with your attention. Reads are like upvotes.</span>
				</li>
				<li>
					<img src="/images/robot-arm.svg" />
					<span>Readup identifies phenomenal writing. RIP clickbait.</span>
				</li>
				<li>
					<img src="/images/read.svg" />
					<span>No ads. No links. 100% distraction-free.</span>
				</li>
				<li>
					<img src="/images/bubble-emoji.svg" />
					<span>Non-readers can’t comment, so conversations are civil and insightful.</span>
				</li>
				<li>
					<img src="/images/group-circle.svg" />
					<span>A community of readers. A better web for everyone.</span>
				</li>
			</ol>
		</div>
		<div className="section">
			<h2>From the community.</h2>
			<p>“Reading the articles has opened me in a way that is exciting and expansive. I love the quality of the selections, the community - the ease of use. This is VERY important, especially given all the evidence recently that people are having a really difficult time even being able to read, to have the ability to concentrate, to focus, to care what the hell they are even putting in their minds! I am SUCH a HUGE fan and grateful for this app.” <em>-Pegeen</em></p>
			<p>“WOW. This content is crazy good.” <em>-Natalie</em></p>
			<p>“From a mindfulness perspective, I enjoy seeing how much my monkey mind tries to make me skip sections and how good a practice it is to stick with it anyway.” <em>-Leo</em></p>
			<p>“I love how thoughtful the comments are.” <em>-Crystal Hana Kim, novelist.</em></p>
			<p>“I’m really enjoying being a user!” <em>-Aram, Director, Ad Tech, Washington Post</em></p>
			<Button
				style="loud"
				onClick={props.onOpenCreateAccountDialog}
			>
				Get Started
			</Button>
		</div>
		<Footer onViewPrivacyPolicy={props.onViewPrivacyPolicy} />
	</div>
);