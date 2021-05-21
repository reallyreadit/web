import * as React from 'react';
import ScreenContainer from './ScreenContainer';
import RouteLocation from '../../../common/routing/RouteLocation';
import Link from '../../../common/components/Link';

interface Props {
	onNavTo: (url: string) => void
}
const PrivacyPolicyPage: React.SFC<Props> = props => (
	<ScreenContainer>
		<div className="privacy-policy-page_75v4wh">
			<h2>Privacy Policy and Terms of Use</h2>
			<h3>Updated: Friday, May 21, 2020</h3>
			<section>
				<p>AS A GENERAL RULE, technology companies — and especially social media companies — don’t want you to read contracts like the one you’re reading right now. They don’t want you to fully understand how they work and what they do with your personal information because they know that it’s unsettling and unethical. So they hide the truth in contracts that are so long, boring and confusing they’re virtually impossible to read.</p>
				<p>As a result, we keep clicking “I agree” to legally binding documents without much of a clue what we’re even agreeing to. It’s a huge problem.</p>
				<p><strong>Readup has nothing to hide. We’re proud of what we’ve built. And we actually want you to read this whole thing closely, so we’re keeping it short, sweet, clear, and hopefully even interesting. In a word: <em>readable</em>.</strong></p>
			</section>
			<section>
				<p>For starters, keep in mind that the word “Readup” can refer to any of the following:</p>
				<ul>
					<li>The technology platform (readup.com, Readup apps and extensions, etc.)</li>
					<li>The community of readers (real human beings) who use the platform</li>
					<li>The corporation, reallyread.it, inc., which owns and operates the platform</li>
					<li>The two-person team, <Link href="https://billloundy.com" onClick={props.onNavTo}>Bill Loundy</Link> and <Link href="https://jeffcamera.com" onClick={props.onNavTo}>Jeff Camera</Link>, who co-own and co-operate the corporation and platform.</li>
				</ul>
				<p>Currently, Bill and Jeff each own 50% of reallyread.it, inc. As new employees and investors acquire ownership stakes in Readup, we promise to always disclose this information to our community of readers.</p>
			</section>
			<section>
				<p><strong>When you read on Readup, you create data.</strong> Sometimes you finish reading articles and sometimes you don’t. Readup keeps track. It needs to, in order to function. For example:</p>
				<ul>
					<li>On Readup, if you want to comment on an article you need to read the whole thing.</li>
					<li>Anonymized, aggregate reading data powers <Link href="https://github.com/reallyreadit/aotd-algorithms" onClick={props.onNavTo}>the algorithm</Link> that curates content and selects the Article of the Day (AOTD). Readup is able to identify the best reading material because Readup “knows” the articles and stories that real humans are really reading to completion. <em>As far as we know, Readup is the only social media platform with a 100% transparent algorithm.</em></li>
				</ul>
				<p><strong>Your reading data is strictly private by default.</strong> The only way that other readers can see what you have read is if you explicitly choose to post or comment on an article after you have read it. There is no “bulk post” or “default public” option; the choice is yours to make on an article by article basis.</p>
				<p>If you want, you can use Readup anonymously or pseudonymously, but once you choose a username you can’t change it.</p>
			</section>
			<section>
				<p><strong>You own your data.</strong> We store and use your data, but you own it. That means:</p>
				<ol>
					<li>You own the rights to the comments you make on Readup.</li>
					<li>At any time, you can request a complete copy of your personal data and we will send it to you. We do this manually, so it might take a few days.</li>
					<li>You can delete your account whenever you want.</li>
					<li><strong className="underline"><em>We never share your reading data with any third parties under any circumstances.</em></strong> We don’t even use common services like Google Analytics or Hotjar which monitor everything you do in the background. The <em>only</em> third party script that runs on Readup is Stripe.js (for fraud detection) during checkout, which Stripe requires us to do.</li>
				</ol>
			</section>
			<section>
				<p><strong>We work very hard to avoid collecting data that we do not need.</strong> As a result, we’re proud to be able to provide you with the following comprehensive overview of ALL data that we collect when you use Readup.</p>
				<p><strong className="underline">Before you create an account on Readup</strong></p>
				<ul>
					<li>If you read an article on the Readup Blog, we generate a random, temporary <b>user ID</b> and store your <b>reading progress</b> in case you want to leave a comment after you finish.</li>
					<li>If you want to get notified when we launch the Android app, we need your <b>email address</b>.</li>
				</ul>
				<p><strong className="underline">When you create an account on Readup</strong></p>
				<ul>
					<li>We require you to provide an <b>email address</b>. (If you confirm your email, we store that too.)</li>
					<li>We require you to choose a <b>username</b> and <b>password</b>. Only the salted password hash is stored in our database.</li>
					<li>We automatically detect your <b>time zone</b> and preferred <b>color scheme</b> (light mode or dark mode) from your device.</li>
					<li>
						We also collect the following analytics to help us understand how new people find us. We need this information to improve the onboarding experience for new readers:
						<ul>
							<li>The <b>referrer URL</b> tells us which website (if any) sent you to Readup.</li>
							<li>The <b>initial path</b> tells us where on Readup you first landed.</li>
							<li>The <b>current path</b> tells us which page on Readup you created an account on.</li>
							<li>The <b>action button</b> tells us which button you pressed to create an account (such as “Header Button” or “Footer Button.”)</li>
							<li>When you complete the onboarding process, we mark <b>onboarding complete</b>.</li>
						</ul>
					</li>
				</ul>
				<p><strong className="underline">If you use a third party authenticator</strong></p>
				<ul>
					<li>
						You can create an account (or connect your existing account) using Apple or Twitter. These companies give us the following data:
						<ul>
							<li>Your <b>email address</b> (This is optional if you use your Apple ID.)</li>
							<li>Your <b>identifier</b> which is a random value used to identify your account</li>
							<li>Twitter also gives us your <b>display name</b>, <b>handle</b>, <b>verification status</b> and an <b>access token</b> to tweet on your behalf (with your explicit permission, of course.)</li>
							<li>Apple gives us your <b>real user rating</b>.</li>
						</ul>
					</li>
				</ul>
				<p><strong className="underline">When you install a Readup browser extension</strong></p>
				<ul>
					<li>We generate a <b>random installation ID</b> to determine when an extension is installed, updated or removed.</li>
					<li>We detect your <b>operating system</b> and <b>processor type</b>. (It’s necessary for us to know if readers are using Linux, Windows or Mac.)</li>
				</ul>
				<p><strong className="underline">When you install the Readup iOS or macOS app</strong></p>
				<ul>
					<li>You can allow or deny notifications. We store an <b>installation ID</b> and <b>device name</b>. If you allow notifications, we also store a <b>token</b>.</li>
					<li>If an unexpected error occurs, an <b>error report</b> is automatically sent to Readup.</li>
				</ul>
				<p><strong className="underline">When you get an email from Readup</strong></p>
				<ul>
					<li>We detect <b>email opens</b> using a tracking pixel image and <b>link clicks</b> with tracking URLs. (This helps us improve the quality of our emails.)</li>
				</ul>
				<p><strong className="underline">When you subscribe</strong></p>
				<ul>
					<li>You can subscribe to Readup using Apple (iOS only) or Stripe (browser only). These companies give us the following data:</li>
					<ul>
						<li>An <strong>identifier</strong>, your <strong>subscription price</strong>, <strong>start and end dates</strong>, <strong>payment status</strong>, <strong>refund status</strong>, <strong>auto-renew preference</strong>, and any <strong>pending upgrades or downgrades</strong>.</li>
					</ul>
					<li>Stripe also provides us with a <strong>random ID</strong> to reference your payment method, your <strong>wallet</strong> (if you pay using a wallet service), your <strong>credit card brand</strong>, and the <strong>last four digits</strong> and <strong>expiration date</strong> of your credit card.</li> 
					<li>Your credit card number is never transmitted to (or stored on) any Readup servers.</li>
				</ul>
				<p><strong className="underline">When you read on Readup</strong></p>
				<ul>
					<li>We store your <b>complete reading history</b> in our database. This is absolutely essential in order for Readup to work.</li>
					<li>We also store your <b>stars</b>, <b>ratings</b>, <b>posts</b> and <b>comments</b>. (Comments can be easily deleted at any time.)</li>
					<li>We store any <b>article issues</b> that you report.</li>
					<li>We keep a record of how your subscription payments get distributed to (1) Apple and/or Stripe (2) Readup and (3) the writers you read.</li>
				</ul>
				<p><strong className="underline">When you update your preferences</strong></p>
				<ul>
					<li>We store your <b>notification preferences</b> and we make it very easy to unsubscribe from everything.</li>
					<li>We store your <b>reading preferences</b> (<b>text size</b>, <b>links on/off</b>.)</li>
				</ul>
			</section>
			<section>
				<p><strong>COOKIES:</strong> Sometimes we use cookies, but never for marketing purposes. And since we only use “<Link href="https://gdpr.eu/cookies/#:~:text=Strictly%20necessary%20cookies%20%E2%80%94%20These%20cookies,example%20of%20strictly%20necessary%20cookies." onClick={props.onNavTo}>strictly necessary cookies</Link>,” we’re not required to make you click “I agree” when we use them.</p>
				<p><strong>CANARY:</strong> Readup has never received a government request for information.</p>
				<p><strong>FEEDBACK:</strong> This contract will continue to evolve. Please share your suggestions <Link href="https://github.com/reallyreadit/privacy-policy" onClick={props.onNavTo}>on GitHub</Link>.</p>
				<p><strong>CONTACT:</strong> Email us. You will always get a reply from a human: <strong><Link href="mailto:support@readup.com" onClick={props.onNavTo}>support@readup.com</Link></strong></p>
			</section>
		</div>
	</ScreenContainer>
);
export function createScreenFactory<TScreenKey>(key: TScreenKey, services: Props) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'Privacy Policy' }),
		render: () => (
			<PrivacyPolicyPage onNavTo={services.onNavTo} />
		)
	};
}
export default PrivacyPolicyPage;