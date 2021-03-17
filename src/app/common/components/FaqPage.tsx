import * as React from 'react';
import ScreenContainer from './ScreenContainer';
import RouteLocation from '../../../common/routing/RouteLocation';
import classNames = require('classnames');
import Icon from '../../../common/components/Icon';
import { useState } from 'react';

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
				answer: <>Maybe. Do you want a cookie?</>
			},
			{
				question: "Can we fly to mars yet?",
				answer: <>Maybe. Do you want a cookie?</>
			},
			{
				question: "How far is asgaard?",
				answer: <>Maybe. Do you want a cookie?</>
			},
			{
				question: "Do I have to pay?",
				answer: <>Maybe. Do you want a cookie?</>
			},
		]
	},
	{
		title: "Importing articles",
		questions: [
			{
				question: "Is Readup coming to Android?",
				answer: <>Maybe. Do you want a cookie?</>
			},
			{
				question: "Can we fly to mars yet?",
				answer: <>Maybe. Do you want a cookie?</>
			},
			{
				question: "How far is asgaard?",
				answer: <>Maybe. Do you want a cookie?</>
			},
			{
				question: "Do I have to pay?",
				answer: <>Maybe. Do you want a cookie?</>
			},
		]
	}
];

const renderFaq = ({question, answer}: Faq) => {
	const [isOpen, setOpen] = useState(false);
	return (<li key={question}>
		<h3 className="question" onClick={() => setOpen(!isOpen)}><Icon name={ isOpen ? "chevron-down" : "chevron-right" } /> {question}</h3>
		<p className={classNames("answer", {"open": isOpen})}>{answer}</p>
	</li>);
}

const renderFaqCategory = (faqCategory: FaqCategory) => {
	return <div
		key={faqCategory.title}
		className="">
			<h2 className="heading-regular">{ faqCategory.title }</h2>
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
		<ScreenContainer>
			<div className="faq-page_35vamf">
				<div className="hero">
					<h1 className="heading-display">Frequently Asked Questions</h1>
					<p>Learn everything you ever wanted to know about Readup.</p>
				</div>
				<div className="sidebar">
					<nav>
						<h3>Jump to</h3>
						<ol>
							{faqs.map(faqCategory => <li key={faqCategory.title}>{ faqCategory.title }</li>)}
						</ol>
					</nav>
				</div>
				<div className="questions">
					{faqs.map(renderFaqCategory)}
				</div>
			</div>
		</ScreenContainer>
	);
}
export function createScreenFactory<TScreenKey>(key: TScreenKey) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'Frequently Asked Questions' }),
		render: () => React.createElement(faqPage)
	};
}
export default faqPage;