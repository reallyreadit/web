import * as React from 'react';
import RouteLocation from '../../../common/routing/RouteLocation';
import classNames = require('classnames');
import Icon from '../../../common/components/Icon';
import { useState } from 'react';
import HomeHero from './BrowserRoot/HomeHero';
import HomePanel from './BrowserRoot/HomePanel';

interface Faq {
	question: string;
	answer: JSX.Element;
}
interface FaqCategory {
    title: string;
    questions: Faq[];
}[];

const faqs: FaqCategory[] = [
	{
		title: "Installing Readup",
		questions: [
			{
				question: "Is Readup coming to Android?",
				answer: <p>Maybe. Do you want a cookie?</p>
			},
			{
				question: "Can we fly to mars yet?",
				answer: <p>Maybe. Do you want a cookie?</p>
			},
			{
				question: "How far is asgaard?",
				answer: <>
					<p>Lorem id in sunt eiusmod. Incididunt eu officia anim duis minim pariatur quis minim. Lorem aliqua esse Lorem eiusmod. Do adipisicing nulla minim qui commodo qui velit eu nostrud ipsum magna labore. Labore esse Lorem do amet occaecat. Voluptate consequat laborum esse amet in sit ea do enim. Sint nisi magna est ex esse.</p>
					<p>Adipisicing ut duis et ea nisi do eu labore velit proident ex. Ullamco proident do consequat dolore duis duis. Dolore excepteur labore reprehenderit exercitation ex. Velit cillum laboris enim nulla cillum consequat voluptate do.</p>
				</>
			},
			{
				question: "Do I have to pay?",
				answer: <p>Maybe. Do you want a cookie?</p>
			},
		]
	},
	{
		title: "Importing articles",
		questions: [
			{
				question: "Is Readup coming to Android?",
				answer: <p>Maybe. Do you want a cookie?</p>
			},
			{
				question: "Can we fly to mars yet?",
				answer: <p>Maybe. Do you want a cookie?</p>
			},
			{
				question: "How far is asgaard?",
				answer: <p>Maybe. Do you want a cookie?</p>
			},
			{
				question: "Do I have to pay?",
				answer: <p>Maybe. Do you want a cookie?</p>
			},
		]
	}
];

const mapToId = (text: string) => text.toLowerCase().replace(/\s/, '-').replace(/[?"'@*]/, '');

const renderFaq = ({question, answer}: Faq) => {
	const [isOpen, setOpen] = useState(false);
	return (<li key={question}>
		<h3
			className="question"
			id={mapToId(question)}
			onClick={() => setOpen(!isOpen)}><Icon className={classNames({"open": isOpen})} name="chevron-right" />
				{question}
		</h3>
		<div className={classNames("answer", {"open": isOpen})}>{answer}</div>
	</li>);
}

const renderFaqCategory = (faqCategory: FaqCategory) => {
	return <div
		key={faqCategory.title}
		className="question-section">
			<h2 className="heading-regular" id={mapToId(faqCategory.title)}>{ faqCategory.title }</h2>
			<ul>
				{faqCategory.questions.map(renderFaq)}
			</ul>
		</div>;
}

const faqPage = () => {
	// transforms the questions to this mapped format: { "category title 1": {"question 1": true, "question 2": false}}
	// const [openState, setOpen] = useState(
	// 		faqs.reduce((acc, fQ) =>
	// 			({
	// 				...acc,
	// 				[fQ.title]: fQ.questions.reduce((qAcc, q) => ({...qAcc, [q.question]: false}), {})
	// 			})
	// 		, {}));

	return (
		<div className="faq-page_35vamf">
			<HomeHero
				title="Frequently Asked Questions"
				description="Learn everything you ever wanted to know about Readup."
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
					{faqs.map(renderFaqCategory)}
				</div>
			</HomePanel>
		</div>
	);
}
export function createScreenFactory<TScreenKey>(key: TScreenKey) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'Frequently Asked Questions' }),
		render: () => React.createElement(faqPage)
	};
}
export default faqPage;