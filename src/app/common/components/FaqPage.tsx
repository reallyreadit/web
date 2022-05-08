import * as React from 'react';
import RouteLocation from '../../../common/routing/RouteLocation';
import classNames = require('classnames');
import Icon from '../../../common/components/Icon';
import { useState, useEffect } from 'react';
import HomeHero from './BrowserRoot/HomeHero';
import HomePanel from './BrowserRoot/HomePanel';
import Button from '../../../common/components/Button';
import Link, {DiscordInviteLink} from '../../../common/components/Link';
import ScreenKey from '../../../common/routing/ScreenKey';
import { NavReference, Screen, SharedState } from './Root';
import UserAccount from '../../../common/models/UserAccount';

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
				question: "How much does Readup cost?",
				answer: <p>Readup is free and supported by the donations of our generous readers on our OpenCollective. Enjoy ad-free reading to your heart's content!</p>
			},
			{
				question: "How do I get started on my iPhone (or iPad)?",
				answer: <p>Download <Link href="https://apps.apple.com/us/app/readup-social-reading/id1441825432" onClick={props.onNavTo}>the app</Link>{" "}
					from the app store.</p>
			},
			{
				question: "How do I get started on my Android?",
				answer: (onOpenNewPlatformNotificationRequestDialog: () => void) => (
				<>
					<p>Shucks! Readup isn't currently available for Android. Tap the button below to get notified when we launch the Android app.</p>
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
				question: "How do I get started on my computer?",
				answer: <p>Download the app for{" "}
					<Link href="https://apps.apple.com/us/app/readup-social-reading/id1441825432" onClick={props.onNavTo}>Mac</Link>,{" "}
					<Link href="https://static.readup.com/downloads/windows/ReadupSetup.exe" onClick={props.onNavTo}>Windows</Link> or{" "}
					<Link href="https://static.readup.com/downloads/linux/latest" onClick={props.onNavTo}>Linux</Link>.
				</p>
			},
			{
				question: "What's a reader name?",
				answer: <p>The word "user" dehumanizes people. In lieu of "usernames," Readup has reader names.</p>
			},
		]
	}),
	props => ({
		title: "Using Readup",
		questions: [
			{
				question: "What can I read on Readup?",
				answer: <p>Anything! Readup curates top-quality articles from across the web. Plus you can easily save (or "import") articles to Readup from pretty much anywhere.</p>
			},
			{
				question: "I noticed a problem within an article. What do I do?",
				answer: <>
							<p>Uh oh! All articles on Readup should display perfectly, but sometimes Readup's ad-destroyer (or "parser") makes a mistake. If you notice a problem within an article, please report it by clicking the flag icon in the top right corner. With our team of volunteers we try to take out these issues!</p>
							<img
								alt="Screenshot of how to report issues on Readup"
								style={{"maxWidth": "min(70vw,450px)", "margin": "0.7em", "boxShadow": "0px 2px 10px #0003", "paddingLeft": "0"}}
								src={props.onCreateStaticContentUrl('/app/images/faq-page/how-to-report-issues-mobile.jpeg')}
							/>
						</>
			},
			{
				question: "When is the Article of the Day selected?",
				answer: <p>The #1 Contender becomes AOTD at midnight Pacific Standard Time. </p>
			},
			{
				question: "Can I use Readup to bypass paywalls?",
				answer: <p>Yes. Readup is essentially a browser that cleans pages up by stripping away everything except the actual article. Many articles that are "hidden" behind soft paywalls are still "visible" in the code. Readup displays those articles.</p>
			},
			{
				question: "Can I change my reader name?",
				answer: <p>No. If you want a new reader name, you need to create a new account.</p>
			}
		]
	}),
	props => ({
		title: "Saving articles",
		questions: [
			{
				question: "Do I need to save articles?",
				answer: <p>Nope. You can always just browse the articles that other people save. But it’s a good thing to{" "}
					know how to do in case you ever want to save a specific article to Readup.</p>
			},
			{
				question: "How do I save articles to Readup on my iPhone?",
				answer: <>
					<p>The Readup share extension in iOS makes it easy to save articles to Readup with just a few clicks.{" "}
					When you are viewing an article you want to save (for example in the Safari app) just click the share extension{" "}
					(a square with an up arrow) and then click the Readup icon. (Note: If you can’t find the Readup icon, you might need to click “More.”){" "}</p>
					<p>You'll receive a notification that you can tap to open the article in Readup directly, and the article will appear at the top of your Starred list in My Reads. </p>
					</>
			},
			{
				question: "How do I save articles to Readup on my laptop or computer?",
				answer: <p>First, get the browser extesion for your browser from our <Link screen={ScreenKey.Download} onClick={props.onNavTo}>Downloads page</Link>. Then just click the browser extension button. When you view an article in Reader Mode, it will automatically be saved to{" "}
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
						<li><strong>In Edge</strong>, right-click the Readup extension icon and click "Extension options."</li>
					</ul>
					<p>Disabling starring is not yet possible in our mobile apps. Let us know in <DiscordInviteLink onClick={props.onNavTo}>our Discord</DiscordInviteLink> if this is something you want!</p>
				</>
			}
		]
	}),
	props => ({
		title: "Privacy",
		questions: [
			{
				question: "Can people see everything I've been reading?",
				answer: <p>No. Your reading history is 100% private by default. On an article-by-article basis, you choose what you want to post publicly.</p>
			},
			{
				question: "Can I trust Readup?",
				answer: <p>Yes! Our <Link onClick={props.onNavTo} screen={ScreenKey.PrivacyPolicy}>Privacy Policy</Link> is short and sweet. Read it.</p>
			}
	]}),
	props => ({
		title: "Writers",
		questions: [
			{
				question: "Why should I get verified?",
				answer: <p>As a writer on Readup you get special powers. Articles you've written will appear on your profile. You can comment on your own articles without reading them, and your comments will be highlighted.</p>
			},
			{
				question: "How do I get verified?",
				answer: <p>Go to {renderSettings(props)}. Click "Get Verified."</p>
			},
		]
	}),
	props => ({
		title: "Misc",
		questions: [
			{
				question: "Who owns Readup?",
				answer: <p>Readup is owned by co-founder Jeff Camera, who also hosts the readup.org infrastructure. Volunteers led by Thor Galle support in maintentance and develop the platform further.</p>
			},
			{
				question: "I'm a developer. Can I help?",
				answer: <p>Maybe! <Link onClick={props.onNavTo} href="https://discord.gg/XQZa8pHdVs">Join our Discord,</Link> then drop us a message in <Link href="https://discord.com/channels/917433643796946964/930514149077835838" onClick={props.onNavTo}>the #development channel</Link></p>
			},
			{
				question: "I'm not a developer. Can I help?",
				answer: <p>Maybe! Let us know how you'd like to contribute in <Link onClick={props.onNavTo} href="https://discord.gg/XQZa8pHdVs">our Discord</Link>. If you can work self-sufficiently, your skills in design/marketing/social media/community management/... would be much appreciated.</p>
			},

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

type Props = {
	location: RouteLocation,
	onNavTo: (ref: NavReference) => void,
	onCreateStaticContentUrl: (path: string) => string,
	onOpenNewPlatformNotificationRequestDialog: () => void,
	user: UserAccount
};


type Services = Pick<Props, Exclude<keyof Props, 'location' | 'user'>> &
	{
		onCreateTitle: () => string
	};

const renderSettings = (props: Props): React.ReactElement<Link> | string => {
	if (props.user) {
		return <Link onClick={props.onNavTo} screen={ScreenKey.Settings}>the Settings screen</Link>
	} else {
		return "the Settings screen in the app";
	}
}

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
				description={<span>If your question isn't answered below, you can try posting it <DiscordInviteLink onClick={props.onNavTo}>on our Discord</DiscordInviteLink>.</span>}
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
		render: (screen: Screen, sharedState: SharedState) => (
				<FaqPage
					location={screen.location}
					onCreateStaticContentUrl={ services.onCreateStaticContentUrl}
					onNavTo={services.onNavTo}
					onOpenNewPlatformNotificationRequestDialog={services.onOpenNewPlatformNotificationRequestDialog}
					user={sharedState.user}
				/>

		)
	};
}
export default FaqPage;