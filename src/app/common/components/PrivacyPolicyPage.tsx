import * as React from 'react';
import ScreenContainer from './ScreenContainer';
import RouteLocation from '../../../common/routing/RouteLocation';
import Link from '../../../common/components/Link';
import ScreenKey from '../../../common/routing/ScreenKey';
import { NavReference } from './Root';
import { getStoreUrl, DeviceType } from '../../../common/DeviceType';

interface Props {
	onNavTo: (ref: NavReference) => void
}
const PrivacyPolicyPage: React.SFC<Props> = props => (
	<ScreenContainer>
		<div className="privacy-policy-page_75v4wh">
			<h2>Privacy Policy and Terms of Use</h2>
			<h3>Updated: Thursday, May 19, 2022</h3>
			<section>
				<p>This privacy policy and terms of use notice applies to The Readup Service ("Service") which comprises the following applications and services:</p>
				<ul>
					<li>The Readup web services hosted at readup.com, readup.org, reallyread.it, and any subdomains thereof.</li>
					<li>The <Link screen={ScreenKey.Download} onClick={props.onNavTo}>Readup Windows and Linux apps</Link>.</li>
					<li>The <Link href={getStoreUrl(DeviceType.Ios)} onClick={props.onNavTo}>Readup iOS app, macOS app, and Safari extension</Link>.</li>
					<li>The <Link href={getStoreUrl(DeviceType.DesktopChrome)} onClick={props.onNavTo}>Readup extension for Google Chrome</Link>.</li>
					<li>The <Link href={getStoreUrl(DeviceType.DesktopFirefox)} onClick={props.onNavTo}>Readup extension for Firefox</Link>.</li>
					<li>The <Link href={getStoreUrl(DeviceType.DesktopEdge)} onClick={props.onNavTo}>Readup extension for Microsoft Edge</Link>.</li>
				</ul>
				<p>The Readup Service is owned and operated by Shore Logic, LLC. ("Service Provider"), a limited liability company based in New Jersey and wholly owned by Jeff Camera, the original developer of the Readup software. The Service is provided free of charge and free of monetization for the express benefit of those who enjoy using the Readup software to read and comment online.</p>
				<p>The source code for the software hosted by The Service is provided by <Link href="https://github.com/reallyreadit" onClick={props.onNavTo}>The Readup Project</Link>. The Service is provided in cooperation with The Readup Collective which may reimburse the Service Provider in part or in full for expenses incurred in the operation of The Service.</p>
				<p>The Service is provided "AS IS", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the Service Provider be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with The Service or the use of or other dealings with The Service.</p>
			</section>
			<section>
				<p>The following is a comprehensive list of all the data that The Service ("we", "us") collects from you as a user. This data is never shared with any third parties and no third party data collection or analytics services are used by The Service.</p>
				<p><strong className="underline">When you interact with a Readup web service</strong></p>
				<ul>
					<li>HTTP request metadata may be logged by the web server including the request date, method, URI, user agent, referrer, status, time taken, client IP address, Readup client type, and Readup user ID.</li>
				</ul>
				<p><strong className="underline">Before you create an account</strong></p>
				<ul>
					<li>If you read an article on the Readup Blog, we generate a random, temporary <b>user ID</b> and store your <b>reading progress</b> in case you want to leave a comment after you finish.</li>
					<li>If you want to get notified when we launch the Android app, we need your <b>email address</b>.</li>
				</ul>
				<p><strong className="underline">When you create an account</strong></p>
				<ul>
					<li>We require you to provide an <b>email address</b>. (If you confirm your email, we store that too.)</li>
					<li>We require you to choose a <b>reader name</b> and <b>password</b>. Only the salted password hash is stored in our database.</li>
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
				<p><strong className="underline">When you install the Readup iOS app, macOS app, Windows app, or Linux app.</strong></p>
				<ul>
					<li>(iOS app and macOS apps only) You can allow or deny notifications. We store an <b>installation ID</b> and <b>device name</b>. If you allow notifications, we also store a <b>token</b>.</li>
					<li>If an unexpected error occurs, an <b>error report</b> is automatically sent to Readup.</li>
				</ul>
				<p><strong className="underline">When you get an email from Readup</strong></p>
				<ul>
					<li>We detect <b>email opens</b> using a tracking pixel image and <b>link clicks</b> with tracking URLs. (This helps us improve the quality of our emails.)</li>
				</ul>
				<p><strong className="underline">When you read on Readup</strong></p>
				<ul>
					<li>We store your <b>complete reading history</b> in our database. This is absolutely essential in order for Readup to work.</li>
					<li>We also store your <b>stars</b>, <b>ratings</b>, <b>posts</b> and <b>comments</b>. (Comments can be easily deleted at any time.)</li>
					<li>We store any <b>article issues</b> that you report.</li>
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