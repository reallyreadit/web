import * as React from 'react';
import RouteLocation from '../../../common/routing/RouteLocation';
import classNames = require('classnames');
import Icon from '../../../common/components/Icon';
import { useState, useEffect } from 'react';
import HomeHero from './BrowserRoot/HomeHero';
import HomePanel from './BrowserRoot/HomePanel';
import Button from '../../../common/components/Button';
import Link from '../../../common/components/Link';
import ScreenKey from '../../../common/routing/ScreenKey';
import { NavReference, Screen } from './Root';
import { HowItWorksVideo, VideoMode } from './HowItWorksVideo';

interface Faq {
	question: string;
	answer: JSX.Element | ((arg: () => void) => JSX.Element);
}
type FaqCategory = (props: Props) => {
    title: string;
    questions: Faq[];
};

const faqs: FaqCategory[] = [
	props => ({
		title: "Getting Started",
		questions: [
			{
				question: "How do I get started on my iPhone?",
				answer: <p>Download <Link href="https://apps.apple.com/us/app/readup-social-reading/id1441825432" onClick={props.onNavTo}>the app</Link>&nbsp;
						from the app store.</p>
			},
			{
				question: "How do I get started on my laptop or computer?",
				answer: <p>First, add the Readup browser extension to your favorite web browser —&nbsp;
					<Link href="https://chrome.google.com/webstore/detail/readup/mkeiglkfdfamdjehidenkklibndmljfi?hl=en-US" onClick={props.onNavTo}>Chrome</Link>,&nbsp;
					<Link href="https://addons.mozilla.org/en-US/firefox/addon/readup/" onClick={props.onNavTo}>Firefox</Link>,&nbsp;
					<Link href="https://apps.apple.com/us/app/readup-social-reading/id1441825432" onClick={props.onNavTo}>Safari</Link> or&nbsp;
					<Link href="https://microsoftedge.microsoft.com/addons/detail/readup/nnnlnihiejbbkikldbfeeefljhpplhcm" onClick={props.onNavTo}>Edge</Link>.&nbsp;
					 Next, look for the Readup button in your browser window (near the URL bar) which enables you to activate Reader Mode&nbsp;
					 on any article you wish to read with just one click.
					 <br/>Finally, remember to visit Readup.com to explore articles, read comments, and manage your account.</p>
			},
			{
				question: "Do I need to create an account?",
				answer: <p>Yes. In addition to downloading the app and/or extensions, you will need to create an account on Readup.</p>
			},
		]
	}),
	props => ({
		title: "Saving articles",
		questions: [
			{
				question: "Do I need to save articles?",
				answer: <p>Nope. You can always just browse the articles that other people save. But it’s a good thing to&nbsp;
					know how to do in case you ever want to save a specific article to Readup.</p>
			},
			{
				question: "Can I save anything I want?",
				answer: <p>Yep! Readup doesn’t enable you to bypass paywalls, but you can save paid articles&nbsp;
					(for example, from the Wall Street Journal) if you pay for them separately.</p>
			},
			{
				question: "How do I save articles to Readup on my iPhone?",
				answer: <p>The Readup share extension in iOS makes it easy to save articles to Readup with just a few clicks.&nbsp;
					When you are viewing an article you want to save (for example in the Safari app) just click the share extension&nbsp;
					(a square with an up arrow) and then click the Readup icon. (Note: If you can’t find the Readup icon, you might need to click “More.”)&nbsp;
					The article will appear at the top of your Starred list in My Reads. </p>
			},
			{
				question: "How do I save articles to Readup on my laptop or computer?",
				answer: <p>Just click the browser button. When you view an article in Reader Mode, it will automatically be saved to&nbsp;
					the History section of My Reads.</p>
			},
			{
				question: "Can I disable the automatic starring of saved articles?",
				answer: <>
					<p>Yes, you can on the desktop apps! You'll find this setting in the extension options page. To find the options:
					</p>
					<ul>
						<li><strong>In Chrome</strong>, right-click the Readup extension icon and click "Options."</li>
						<li><strong>In Firefox</strong>, right-click the Readup extension icon, click "Manage Extension", then click the triple-dot menu next to the Readup extension, then click "Options."</li>
						<li><strong>In Safari</strong>, right-click the Readup extension icon, click "Manage Extension...", then click "Preferences" in the pane that pops up.</li>
					</ul>
					<p>Disabling starring is not yet possible in our mobile apps. Send us an email at <Link href="mailto:support@readup.com" onClick={props.onNavTo}>support@readup.com</Link> if this is something you want!</p>
				</>
			}
		]
	}),
	props => ({
		title: "Reading on Readup",
		questions: [
			{
				question: "Why didn’t I get credit for something I read?",
				answer: <p>Make sure that you’re reading in Reader Mode in order to get credit.</p>
			},
			{
				question: "Am I “reading” too fast?",
				answer: <p>Maybe. Fast reading is okay, but Readup won’t give you credit for skimming or scanning. If you think that Readup isn’t&nbsp;
					giving you credit for articles you’re really reading, please send us an email: <Link href="mailto:support@readup.com" onClick={props.onNavTo}>support@readup.com</Link></p>
			},
			{
				question: "What if a specific article doesn’t work?",
				answer: <p>Please flag any article errors by clicking the small flag in the top right corner of Reader Mode.</p>
			},
			{
				question: "Who chooses the Article of the Day?",
				answer: <p>Everybody! The Article of the Day (AOTD) is "crowdsourced." At midnight (Pacific Time) the #1 top ranked article becomes the AOTD for the following day.</p>
			}
		]
	}),
	props => ({
		title: "Privacy",
		questions: [
			{
				question: "Does Readup track my reading?",
				answer: <p>Yes. But it is completely secure and anonymous. Our <Link screen={ScreenKey.PrivacyPolicy} onClick={props.onNavTo}>Privacy Policy</Link> is short and sweet&nbsp;
				and we highly suggest you read it.</p>
			},
			{
				question: "Will other people know what I’ve been reading?",
				answer: <p>Not by default. After you finish an article, you can choose to post it publicly.&nbsp;
					Otherwise, all of your reading stays totally private.</p>
			}
		]
	}),
	props => ({
		title: "Billing",
		questions: [
			{
				question: "How much does Readup cost?",
				answer: <p>If you create an account on iOS (iPhone or iPad) you have three choices: $4.99, $14.99 or $24.99. If you create an account on desktop, you can choose one of those three prices or choose any custom price.</p>
			},
			{
				question: "Can I really pick ANY price?",
				answer: <p>Yes, but only on desktop. On iOS you have three price choices.</p>
			},
			{
				question: "Is there a minimum subscription price?",
				answer: <p>Yes. $4.99.</p>
			},
			{
				question: "Are some features only available at certain pricing levels?",
				answer: <p>No. All Readers at all levels get full access to all features. The only difference is that when you pay more (or less) to read on Readup you are giving more (or less) to the writers you read.</p>
			},
			{
				question: "Can I get a refund?",
				answer: <p>Yes. Just send an email to <Link href="mailto:support@readup.com" onClick={props.onNavTo}>support@readup.com</Link></p>
			}
		]
	}),
	props => ({
		title: "Writers",
		questions: [
			{
				question: "What is writer verification?",
				answer: <p>Verification on Readup is for writers only. Verification proves that your account is real and connects your account and identity to the articles you've written.</p>
			},
			{
				question: "Why should I get verified?",
				answer: <p>As a verified writer, your articles will appear on your profile. Also, you won't have to read your own articles in order to comment on them, and your comments will be prioritized and highlighted. Most importantly, verified writers can collect their earnings.</p>
			},
			{
				question: "How do I get verified?",
				answer: <p>Create an account on Readup. Go to Settings. Click "Get Verified."</p>
			},
			{
				question: "Is there a minimum to cash out?",
				answer: <p>Yes. You must earn at least $10.00 on Readup in order to cash out. To hit the minimum, encourage your readers to read you on Readup and share the link to your profile page. Posting your own articles and participating in conversations about your own articles is another way to get more readers.</p>
			},
			{
				question: "Is there a time limit to cash out?",
				answer: <p>No. Writer earnings do not expire. Readup will hold the balance indefinitely, so you never have to worry about losing the money you have earned.</p>
			},
			{
				question: "How much money has Readup earned for writers?",
				answer: <p>Writer earnings and total Readup revenue are visible on the homepage and at the bottom of the menu. Individual, finalized distributions, broken down by writer, are visible <Link screen={ScreenKey.Leaderboards} onClick={props.onNavTo}>here</Link>.</p>
			},
			{
				question: "What do you do with money earned by deceased writers?",
				answer: <p>Money earned by dead writers (Ernest Hemingway and Toni Morrison, for example) gets donated to <Link href="https://www.eff.org/" onClick={props.onNavTo}>EFF: Electronic Frontier Foundation</Link>. Readup’s mission aligns with the work that EFF does to defend digital privacy, free speech, and innovation.</p>
			},
			{
				question: "Do I have to pay taxes on the money on earn on Readup?",
				answer: (
					<>
						<p>USA residents: Maybe. If you earn less than $600 in one year, you don't have to worry about it. If you earn more than $600, Stripe will provide the necessary paperwork for you. For more information: <Link href="https://stripe.com/docs/connect/tax-reporting" onClick={props.onNavTo}>https://stripe.com/docs/connect/tax-reporting</Link></p>
						<p>Non-USA residents: Maybe. Check with your local rules, and let us know if you have any questions.</p>
						<p>No matter where you live, the Readup team is here to help!</p>
					</>
				)
			},
			{
				question: "What if a writer declines to get paid?",
				answer: <p>We recognize that some writers will decline payment from Readup for legal, ethical, or personal reasons. In that case, we’re happy to donate the money to <Link href="https://www.eff.org/" onClick={props.onNavTo}>EFF: Electronic Frontier Foundation</Link> or any charity that the writer chooses.</p>
			}
		]
	}),
	props => ({
		title: "Misc",
		questions: [
			{
				question: "Can I change my reader name?",
				answer: <p>No. If you want a new reader name, you need to create a new account.</p>
			},
			{
				question: "Do you have an Android app?",
				answer: (onOpenNewPlatformNotificationRequestDialog: () => void) => (
				<>
					<p>Not yet, but we will soon!<br/>Hit this button to get notified when we do.</p>
					<div className="faq-android-notify">
						<Button
							text="Get Notified"
							size="x-large"
							intent="loud"
							onClick={onOpenNewPlatformNotificationRequestDialog}/>
					</div>
				</>
				)
			},
			{
				question: "Who started Readup?",
				answer: (<p>Two friends, <Link href="https://billloundy.com/" onClick={props.onNavTo}>Bill Loundy</Link> and <Link href="https://jeffcamera.com/" onClick={props.onNavTo}>Jeff Camera</Link>.&nbsp;
					(We love reading and you’ll often see us in the comments. We’re <Link screen={ScreenKey.Profile} params={{ 'userName': 'bill' }} onClick={props.onNavTo}>@bill</Link> and <Link screen={ScreenKey.Profile} params={{ 'userName': 'jeff' }} onClick={props.onNavTo}>@jeff</Link>.)</p>)
			},
			{
				question: "How does Readup make money? ",
				answer: (<p>Readers pay to read on Readup. Readup takes 5% and gives the rest to writers.</p>)
			},
			{
				question: "Are you hiring?",
				answer: <p>Yes! Email us if you’re interested in joining the team: <Link href="mailto:support@readup.com" onClick={props.onNavTo}>support@readup.com</Link></p>
			},
			{
				question: "Does Readup work with publishers?",
				answer: <p>Not yet, but we plan to. If you are a publisher and you’d like to have a conversation, don’t hesitate to reach out:&nbsp;
					<Link href="mailto:support@readup.com" onClick={props.onNavTo}>support@readup.com</Link></p>
			}
		]
	})
];

const mapToId = (text: string) => text.toLowerCase().replace(/\s/g, '-').replace(/[?"'@*]/g, '');

const renderFaq = (onOpenNewPlatformNotificationRequestDialog: () => void, {question, answer}: Faq) => {
	const [isOpen, setOpen] = useState(false);
	return (<li key={question}>
		<h3
			className="question"
			id={mapToId(question)}
			onClick={() => setOpen(!isOpen)}><Icon className={classNames({"open": isOpen})} name="chevron-right" />
				{question}
		</h3>
		<div className={classNames("answer", {"open": isOpen})}>{typeof answer === 'function'  ? answer(onOpenNewPlatformNotificationRequestDialog) : answer}</div>
	</li>);
}

const renderFaqCategory = (props: Props, createFaqCategory: FaqCategory) => {
	const faqCategory = createFaqCategory(props);
	return <div
		key={faqCategory.title}
		className="question-section">
			<h2 className="heading-regular" id={mapToId(faqCategory.title)}>{ faqCategory.title }</h2>
			<ul>
				{faqCategory.questions.map(renderFaq.bind(null, props.onOpenNewPlatformNotificationRequestDialog))}
			</ul>
		</div>;
}

type CoreProps = {
	location: RouteLocation,
	onNavTo: (ref: NavReference) => void,
	onOpenNewPlatformNotificationRequestDialog: () => void
};
type VideoProps = {
	videoMode: VideoMode.Embed
} | {
	videoMode: VideoMode.Link,
	onCreateStaticContentUrl: (path: string) => string
};
type Props = CoreProps & VideoProps;

type Services = Pick<CoreProps, Exclude<keyof CoreProps, 'location'>> &
	VideoProps & {
		onCreateTitle: () => string
	};

function jumpTo(url: string) {
	const target = document.getElementById(
		url.split('#')[1]
	);
	target?.scrollIntoView({
		behavior: 'smooth',
		block: 'start'
	});
}

const FaqPage = (props: Props): JSX.Element => {
	// transforms the questions to this mapped format: { "category title 1": {"question 1": true, "question 2": false}}
	// const [openState, setOpen] = useState(
	// 		faqs.reduce((acc, fQ) =>
	// 			({
	// 				...acc,
	// 				[fQ.title]: fQ.questions.reduce((qAcc, q) => ({...qAcc, [q.question]: false}), {})
	// 			})
	// 		, {}));

	// TODO: bumping fixed sidebar
	// const [fixed, setFixed] = React.useState(false);
	// React.useEffect(() => {
	// 	// set up sidebar dynamic scroll listener
	// 	const header = document.querySelector('header');
	// 	const homeHero = document.querySelector('.home-hero_527aw5');
	// 	const mainScrollContainer = document.querySelector('main .screen');
	// 	if (header && homeHero && mainScrollContainer) {
	// 		const headerHeight = header.offsetHeight;
	// 		const homeHeroHeight = header.offsetHeight;
	// 		mainScrollContainer.addEventListener('scroll', (e) => {
	// 			const scrollOffset = mainScrollContainer.scrollTop;
	// 			const sidebar = document.querySelector('.sidebar');
	// 			if (scrollOffset > homeHeroHeight && !fixed) {
	// 				(sidebar as unknown as ElementCSSInlineStyle).style.position = 'fixed';
	// 				(sidebar as unknown as ElementCSSInlineStyle).style.top = headerHeight + 40 + 'px';
	// 				setFixed(true);
	// 			} else if (fixed === true) {
	// 				(sidebar as unknown as ElementCSSInlineStyle).style.position = 'static';
	// 				(sidebar as unknown as ElementCSSInlineStyle).style.top = 0 + 'px';
	// 				setFixed(false)
	// 			}
	// 		});
	// 	}
	// }, []);

	// Chrome doesn't scroll to the fragment for some reason so jumpTo manually on initial load.
	useEffect(
		() => {
			if (props.location.fragment) {
				jumpTo(props.location.fragment);
			}
		},
		[]
	);

	return (
		<div className="faq-page_35vamf">
			<HomeHero
				title="Frequently Asked Questions"
				description={
					<>
						<span>If your question isn't answered below, please send an email to <Link href="mailto:support@readup.com" onClick={props.onNavTo}>support@readup.com</Link>.</span>
						<span>For a general overview on Readup, watch this 3-minute demo video:</span>
						{props.videoMode === VideoMode.Embed ?
							<HowItWorksVideo mode={VideoMode.Embed} /> :
							<HowItWorksVideo
								mode={VideoMode.Link}
								onCreateStaticContentUrl={props.onCreateStaticContentUrl}
								onNavTo={props.onNavTo}
							/>}
					</>
				}
			/>
			<HomePanel className="faq-content">
				<div className="sidebar">
					<nav>
						<h3>Jump to</h3>
						<ol>
							{faqs.map(
								createfaqCategory => {
									const faqCategory = createfaqCategory(props);
									return (
										<li key={faqCategory.title}><Link href={`#${mapToId(faqCategory.title)}`} onClick={jumpTo}>{ faqCategory.title }</Link></li>
									)
								}
							)}
						</ol>
					</nav>
				</div>
				<div className="questions">
					{faqs.map(renderFaqCategory.bind(null, props))}
				</div>
			</HomePanel>
		</div>
	);
}
export function createScreenFactory<TScreenKey>(key: TScreenKey, services: Services) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: services.onCreateTitle() }),
		render: (screen: Screen) => (
			services.videoMode === VideoMode.Embed ?
				<FaqPage
					location={screen.location}
					onNavTo={services.onNavTo}
					onOpenNewPlatformNotificationRequestDialog={services.onOpenNewPlatformNotificationRequestDialog}
					videoMode={VideoMode.Embed}
				/> :
				<FaqPage
					location={screen.location}
					onCreateStaticContentUrl={services.onCreateStaticContentUrl}
					onNavTo={services.onNavTo}
					onOpenNewPlatformNotificationRequestDialog={services.onOpenNewPlatformNotificationRequestDialog}
					videoMode={VideoMode.Link}
				/>
		)
	};
}
export default FaqPage;