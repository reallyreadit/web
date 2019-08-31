import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App, { Props } from './components/App';
import EventPageApi from './EventPageApi';
import PostForm from '../../common/models/social/PostForm';

const eventPageApi = new EventPageApi({
	onPushState: state => {
		setState(state);
	}
});
eventPageApi
	.load()
	.then(state => {
		setState({
			...state,
			onAckNewReply: ackNewReply,
			onActivateReaderMode: activateReaderMode,
			onDeactivateReaderMode: deactiveReaderMode,
			onPostArticle: postArticle,
			onToggleContentIdentificationDisplay: toggleContentIdentificationDisplay,
			onToggleReadStateDisplay: toggleReadStateDisplay,
			onToggleStar: toggleArticleStar
		});
	});

function ackNewReply() {
	eventPageApi.ackNewReply();
}
function activateReaderMode() {
	if (props.activeTab) {
		eventPageApi.activateReaderMode(props.activeTab.id);
		setState({
			activeTab: {
				...props.activeTab,
				isReaderModeActivated: true
			}
		});
	}
}
function deactiveReaderMode() {
	if (props.activeTab) {
		eventPageApi.deactivateReaderMode(props.activeTab.id);
		setState({
			activeTab: {
				...props.activeTab,
				isReaderModeActivated: false
			}
		});
	}
}
function postArticle(form: PostForm) {
	return eventPageApi.postArticle(form);
}
function toggleArticleStar() {
	if (props.article) {
		return eventPageApi
			.setStarred(props.article.id, !props.article.dateStarred)
			.then(article => {
				setState({ article });
			});
	}
	return Promise.reject();
}
function toggleContentIdentificationDisplay() {
	if (props.activeTab) {
		eventPageApi.toggleContentIdentificationDisplay(props.activeTab.id);
	}
}
function toggleReadStateDisplay() {
	if (props.activeTab) {
		eventPageApi.toggleReadStateDisplay(props.activeTab.id);
	}
}

let props: Props;
function setState(newProps?: Partial<Props>) {
	ReactDOM.render(
		React.createElement(
			App,
			props = {
				...props,
				...newProps
			}
		),
		document.getElementById('root')
	);
}