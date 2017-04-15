import EventPageApi from './EventPageApi';
import readingParameters from '../../common/readingParameters';

console.log('loading main.ts...');

const eventPageApi = new EventPageApi(),
	overlayCheckbox = document.getElementById('show-overlay') as HTMLInputElement;

eventPageApi
	.getState()
	.then(state => {
		if (state.userArticle) {
			const slugParts = state.userArticle.slug.split('_'),
				percentCompleteLabel = document.getElementById('percent-complete'),
				commentsAnchor = document.getElementById('comments') as HTMLAnchorElement;
			document.getElementById('article-title').textContent = state.userArticle.title.length > 48 ?
				state.userArticle.title.substr(0, 48).trim() + '...' :
				state.userArticle.title;
			percentCompleteLabel.classList.toggle('unlocked', state.userArticle.percentComplete >= readingParameters.articleUnlockThreshold);
			percentCompleteLabel.firstElementChild.textContent = state.userArticle.percentComplete.toFixed() + '%';
			commentsAnchor.href = `${config.web.protocol}://${config.web.host}/articles/${slugParts[0]}/${slugParts[1]}`;
			commentsAnchor.innerText = state.userArticle.commentCount + ' ' + (state.userArticle.commentCount === 1 ? 'comment' : 'comments');
			document.getElementById('article-placeholder').style.display = 'none';
		} else {
			document.getElementById('article-info').style.display = 'none';
		}
		overlayCheckbox.checked = state.showOverlay;
	});

(document.getElementById('home-link') as HTMLAnchorElement).href = `${config.web.protocol}://${config.web.host}`;
overlayCheckbox.addEventListener('change', e => eventPageApi.updateShowOverlay((e.currentTarget as HTMLInputElement).checked));