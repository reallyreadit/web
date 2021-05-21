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
	_ => ({
		title: "Importing articles",
		questions: [
			{
				question: "Do I need to import articles?",
				answer: <p>Nope. You can always just browse the articles that other people import. But it’s a good thing to&nbsp;
					know how to do in case you ever want to import a specific article to Readup.</p>
			},
			{
				question: "Can I import anything I want?",
				answer: <p>Yep! Readup doesn’t enable you to bypass paywalls, but you can import paid articles&nbsp;
					(for example, from the Wall Street Journal) if you pay for them separately.</p>
			},
			{
				question: "How do I import articles to Readup on my iPhone?",
				answer: <p>The Readup share extension in iOS makes it easy to import articles to Readup with just a few clicks.&nbsp;
					When you are viewing an article you want to import (for example in the Safari app) just click the share extension&nbsp;
					(a square with an up arrow) and then click the Readup icon. (Note: If you can’t find the Readup icon, you might need to click “More.”)&nbsp;
					The article will appear at the top of your Starred list in My Reads. </p>
			},
			{
				question: "How do I import articles to Readup on my laptop or computer?",
				answer: <p>Just click the browser button. When you view an article in Reader Mode, it will automatically be saved to&nbsp;
					the History section of My Reads.</p>
			},
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
				question: "What is verification?",
				answer: <p>Verification proves that your account is real and connects your account and identity to the articles you’ve written. As a verified writer, you don’t have to read your own articles in order to comment on them, and your comments will be prioritized and highlighted. Verified writers get special Writer Profiles. And verified Writers can cash out.</p>
			},
			{
				question: "How do writers get verified?",
				answer: <p>To get verified, send an email to <Link href="mailto:support@readup.com" onClick={props.onNavTo}>support@readup.com</Link>. A human will verify you.</p>
			},
			{
				question: "How does Readup pay the writers?",
				answer: (
					<>
						<p>Eventually we will have a "cash out" feature. For now, we will process payments to writers manually. It's a two step process.</p>
						<ol>
							<li>Get verified. Readup can't pay writers who aren't verified.</li>
							<li>Send an email to <Link href="mailto:support@readup.com" onClick={props.onNavTo}>support@readup.com</Link> and let us know your preferred payment method: Venmo or Paypal. A human will send you your money within a few business days and set up a payment schedule that works for you.</li>
						</ol>
					</>
				)
			},
			{
				question: "Is there a minimum to cash out?",
				answer: <p>Yes. You must earn at least $10.00 on Readup in order to cash out. To hit the minimum, encourage your readers to read you on Readup and share the link to your profile page. Posting your own articles and participating in conversations about your own articles is another way to get more readers.</p>
			},
			{
				question: "Is there a minimum to cash out?",
				answer: <p>Yes. You must earn at least $10.00 on Readup in order to cash out.</p>
			},
			{
				question: "Is there a time limit to cash out?",
				answer: <p>No. Writer earnings do not expire. Readup will hold the balance indefinitely, so you never have to worry about losing the money you have earned.</p>
			},
			{
				question: "How much money has Readup earned for writers?",
				answer: <p>Writer earnings and total Readup revenue are visible on the homepage and at the bottom of the menu. Individual, finalized distributions, broken down by writer, are visible <a href="https://readup.com/earnings">here</a>.</p>
			}
		]
	}),
	props => ({
		title: "Misc",
		questions: [
			{
				question: "Can I change my username?",
				answer: <p>No. If you want a new username, you need to create a new account.</p>
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

interface Props {
	location: RouteLocation,
	onNavTo: (ref: NavReference) => void,
	onOpenNewPlatformNotificationRequestDialog: () => void
}

type Services = Pick<Props, Exclude<keyof Props, 'location'>> & {
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
					<>If your question isn't answered below, please send an email to <Link href="mailto:support@readup.com" onClick={props.onNavTo}>support@readup.com</Link>.</>
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
			<FaqPage
				location={screen.location}
				onNavTo={services.onNavTo}
				onOpenNewPlatformNotificationRequestDialog={services.onOpenNewPlatformNotificationRequestDialog}
			/>
		)
	};
}
export default FaqPage;