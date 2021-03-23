import * as React from 'react';
import RouteLocation from '../../../common/routing/RouteLocation';
import classNames = require('classnames');
import Icon from '../../../common/components/Icon';
import { useState } from 'react';
import HomeHero from './BrowserRoot/HomeHero';
import HomePanel from './BrowserRoot/HomePanel';
import Button from '../../../common/components/Button';

interface Faq {
	question: string;
	answer: JSX.Element | ((arg: () => void) => JSX.Element);
}
interface FaqCategory {
    title: string;
    questions: Faq[];
}[];

const faqs: FaqCategory[] = [
	{
		title: "Getting Started",
		questions: [
			{
				question: "How do I get started on my iPhone?",
				answer: <p>Download <a href="https://apps.apple.com/us/app/readup-social-reading/id1441825432">the app</a>&nbsp;
						from the app store.</p>
			},
			{
				question: "How do I get started on my laptop or computer?",
				answer: <p>First, add the Readup browser extension to your favorite web browser —&nbsp;
					<a href="https://chrome.google.com/webstore/detail/readup/mkeiglkfdfamdjehidenkklibndmljfi?hl=en-US">Chrome</a>,&nbsp;
					<a href="https://addons.mozilla.org/en-US/firefox/addon/readup/">Firefox</a>,&nbsp;
					<a href="https://apps.apple.com/us/app/readup-social-reading/id1441825432">Safari</a> or&nbsp;
					<a href="https://microsoftedge.microsoft.com/addons/detail/readup/nnnlnihiejbbkikldbfeeefljhpplhcm">Edge</a>.&nbsp;
					 Next, look for the Readup button in your browser window (near the URL bar) which enables you to activate Reader Mode&nbsp;
					 on any article you wish to read with just one click.
					 <br/>Finally, remember to visit Readup.com to explore articles, read comments, and manage your account.</p>
			},
			{
				question: "Do I need to create an account?",
				answer: <p>Yes. In addition to downloading the app and/or extensions, you will need to create an account on Readup.</p>
			},
		]
	},
	{
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
	},
	{
		title: "Reading on Readup",
		questions: [
			{
				question: "Why didn’t I get credit for something I read?",
				answer: <p>Make sure that you’re reading in Reader Mode in order to get credit.</p>
			},
			{
				question: "Am I “reading” too fast?",
				answer: <p>Maybe. Fast reading is okay, but Readup won’t give you credit for skimming or scanning. If you think that Readup isn’t&nbsp;
					giving you credit for articles you’re really reading, please send us an email: <a href="mailto:support@readup.com">support@readup.com</a></p>
			},
			{
				question: "What if a specific article doesn’t work?",
				answer: <p>Please flag any article errors by clicking the small flag in the top right corner of Reader Mode.</p>
			}
			{
				question: "Who chooses the Article of the Day?",
				answer: <p>Everybody! The Article of the Day (AOTD) is "crowdsourced." At midnight (Pacific Time) the #1 top ranked article becomes the Article of the Day (AOTD) for the following day.</p>
			}
		]
	},
	{
		title: "Privacy",
		questions: [
			{
				question: "Does Readup track my reading?",
				answer: <p>Yes. But it is completely secure and anonymous. Our <a href="https://readup.com/privacy">Privacy Policy</a> is short and sweet&nbsp;
				and we highly suggest you read it.</p>
			},
			{
				question: "Will other people know what I’ve been reading?",
				answer: <p>Not by default. After you finish an article, you can choose to post it publicly.&nbsp;
					Otherwise, all of your reading stays totally private.</p>
			},
			{
				question: "Can I delete my account?",
				answer: <p>Yes. Just send an email to <a href="mailto:support@readup.com">support@readup.com</a></p>
			}
		]
	},
	{
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
				// todo: make onViewProfile available in this page
				answer: (<p>Two friends, <a href="https://billloundy.com/">Bill Loundy</a> and <a href="https://jeffcamera.com/">Jeff Camera</a>.&nbsp;
					(We love reading and you’ll often see us in the comments. We’re <a href="/@bill">@bill</a> and <a href="/@jeff">@jeff</a>.)</p>)
			},
			{
				question: "How does Readup make money? ",
				// todo: make onViewProfile available in this page
				answer: (<p>Currently, Readup doesn’t make money. And if you join now you’ll stay free for life.&nbsp;
					But, soon, new Readers will have to pay to read on Readup.</p>)
			},
			{
				question: "Are you hiring?",
				// todo: make onViewProfile available in this page
				answer: <p>Yes! Email us if you’re interested in joining the team: <a href="mailto:support@readup.com">support@readup.com</a></p>
			},
			{
				question: "Does Readup work with publishers?",
				answer: <p>Not yet, but we plan to. If you are a publisher and you’d like to have a conversation, don’t hesitate to reach out:&nbsp;
					<a href="mailto:support@readup.com">support@readup.com</a></p>
			}
		]
	}
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

const renderFaqCategory = (onOpenNewPlatformNotificationRequestDialog: () => void, faqCategory: FaqCategory) => {
	return <div
		key={faqCategory.title}
		className="question-section">
			<h2 className="heading-regular" id={mapToId(faqCategory.title)}>{ faqCategory.title }</h2>
			<ul>
				{faqCategory.questions.map(renderFaq.bind(null, onOpenNewPlatformNotificationRequestDialog))}
			</ul>
		</div>;
}

interface Props {
	onOpenNewPlatformNotificationRequestDialog: () => void
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

	return (
		<div className="faq-page_35vamf">
			<HomeHero
				title="Frequently Asked Questions"
				description="If your question isn't answered below, send us an email: support@readup.com"
			/>
			<HomePanel className="faq-content">
				<div className="sidebar">
					<nav>
						<h3>Jump to</h3>
						<ol>
							{faqs.map(faqCategory => <li key={faqCategory.title}><a href={`#${mapToId(faqCategory.title)}`} >{ faqCategory.title }</a></li>)}
						</ol>
					</nav>
				</div>
				<div className="questions">
					{faqs.map(renderFaqCategory.bind(null, props.onOpenNewPlatformNotificationRequestDialog))}
				</div>
			</HomePanel>
		</div>
	);
}
export function createScreenFactory<TScreenKey>(key: TScreenKey, props: Props) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'Frequently Asked Questions' }),
		render: () => <FaqPage {...props}></FaqPage>
		// render: () => <FaqPage onOpenNewPlatformNotificationRequestDialog={() => {}}></FaqPage>
	};
}
export default FaqPage;