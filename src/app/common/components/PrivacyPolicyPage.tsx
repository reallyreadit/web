import * as React from 'react';

const privacyPolicyPage = () => (
	<div className="privacy-policy-page copy-page">
		<section>
			<p><strong>reallyread.it Privacy Policy</strong></p>
			<p>Last Updated: Sunday, June 4, 2017</p>
			<p>This privacy policy (&ldquo;Policy&rdquo;) describes how reallyread.it, and all related products, entities and companies (&ldquo;Company&rdquo;), collect, use and share the personal information of consumer users of our Chrome extension and our website, <a href="https://reallyread.it">https://reallyread.it</a> (the &ldquo;Site&rdquo;). This Policy also applies to any of our other websites that post this Policy. This Policy does not apply to websites that post different statements.</p>
		</section>
		<section>
			<p><strong>WHAT WE COLLECT</strong></p>
			<p>We get information about you in a range of ways.</p>
			<p><strong>(1) Information You Give Us.</strong> We collect your&lrm; name, email address, username, password as well as other information you directly give us on our Site.</p>
			<p><strong>(2) Information We Get From Others.</strong> We may get information about you from other sources. We may add this to information we get from this Site.</p>
			<p><strong>(3) Information Automatically Collected.</strong> We automatically log information about you, your computer, your browsing activity. For example, when visiting our Site, we log your operating system type, browser type, browser language, the website you visited before browsing to our Site, pages you viewed, how long you spent on a page, access times and information about your use of and actions on our Site. <em>At this time, we do not track or use any info other than the reading progress of articles.</em></p>
			<p><strong>(4) Cookies.</strong> We may log information using &ldquo;cookies.&rdquo; Cookies are small data files stored on your hard drive by a website. We may use both session Cookies (which expire once you close your web browser) and persistent Cookies (which stay on your computer until you delete them) to provide you with a more personal and interactive experience on our Site. This type of information is collected to make the Site more useful to you and to tailor the experience with us to meet your special interests and needs.</p>
		</section>
		<section>
			<p><strong>USE OF PERSONAL INFORMATION</strong></p>
			<p>We use your personal information as follows:</p>
			<ul>
				<li>We use your personal information to operate, maintain, and improve our sites, products, and services.</li>
				<li>We use your personal information to send information including confirmations, invoices, technical notices, updates, security alerts, and support and administrative messages.</li>
				<li>We use your personal information to communicate about promotions, upcoming events, and other news about products and services offered by us and our selected partners.</li>
				<li>We use your personal information to link or combine user information with other personal information.</li>
				<li>We use your personal information to protect, investigate, and deter against fraudulent, unauthorized, or illegal activity.</li>
				<li>We use your personal information to provide and deliver products and services customers request.</li>
			</ul>
		</section>
		<section>
			<p><strong>SHARING OF PERSONAL INFORMATION</strong></p>
			<p>We may share personal information as follows:</p>
			<ul>
				<li>We may share personal information with your consent. For example, you may let us share personal information with others for their own marketing uses. Those uses will be subject to their privacy policies.</li>
				<li>We may share personal information when we do a business deal, or negotiate a business deal, involving the sale or transfer of all or a part of our business or assets. These deals can include any merger, financing, acquisition, or bankruptcy transaction or proceeding.</li>
				<li>We may share personal information for legal, protection, and safety purposes.&nbsp;</li>
				<li>We may share information to comply with laws.&nbsp;</li>
				<li>We may share information to respond to lawful requests and legal processes.&nbsp;</li>
				<li>We may share information to protect the rights and property of reallyread.it, our agents, customers, and others. This includes enforcing our agreements, policies, and terms of use.&nbsp;</li>
				<li>We may share information in an emergency. This includes protecting the safety of our employees and agents, our customers, or any person.&nbsp;</li>
				<li>We may share information with those who need it to do work for us.</li>
				<li>We may also share aggregated and/or anonymized data with others for their own uses.</li>
			</ul>
		</section>
		<section>
			<p><strong>INFORMATION CHOICES AND CHANGES</strong></p>
			<p>Our marketing emails tell you how to &ldquo;opt-out.&rdquo; If you opt out, we may still send you non-marketing emails. Non-marketing emails include emails about your accounts and our business dealings with you.</p>
			<p>You may send requests about personal information to our Contact Information below. You can request to change contact choices, opt-out of our sharing with others, and update your personal information.</p>
			<p>You can typically remove and reject cookies from our Site with your browser settings. Many browsers are set to accept cookies until you change your settings. If you remove or reject our cookies, it could affect how our Site works for you.</p>
		</section>
		<section>
			<p><strong>CHANGES TO THIS PRIVACY POLICY.</strong> We may change this privacy policy. If we make any changes, we will change the Last Updated date above.</p>
		</section>
		<section>
			<p><strong>CONTACT INFORMATION.</strong> Our email address is <a href="mailto:support@reallyread.it">support@reallyread.it</a>.</p>
		</section>
	</div>
);
export function createScreenFactory<TScreenKey>(key: TScreenKey) {
	return {
		create: () => ({ key }),
		render: () => React.createElement(privacyPolicyPage)
	};
}
export default privacyPolicyPage;