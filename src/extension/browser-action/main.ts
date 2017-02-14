import EventPageApi from './EventPageApi';

console.log('loading main.ts...');

const authCheckbox = document.getElementsByName('authenticated')[0] as HTMLInputElement,
	  articleTitleCell = document.querySelector('td[data-name="articleTitle"]') as HTMLTableCellElement,
	  percentCompleteCell = document.querySelector('td[data-name="percentComplete"]') as HTMLTableCellElement,
	  overlayCheckbox = document.getElementsByName('showOverlay')[0] as HTMLInputElement;

const eventPageApi = new EventPageApi();

eventPageApi
	.getState()
	.then(state => {
		authCheckbox.checked = state.isAuthenticated;
		articleTitleCell.innerText = state.userArticle ? state.userArticle.title : 'N/A',
		articleTitleCell.classList.toggle('null', !state.userArticle);
		percentCompleteCell.innerText = state.userArticle ? state.userArticle.percentComplete + '%' : 'N/A';
		percentCompleteCell.classList.toggle('null', !state.userArticle);
		overlayCheckbox.checked = state.showOverlay;
	});

overlayCheckbox.addEventListener('change', e => eventPageApi.updateShowOverlay((e.target as HTMLInputElement).checked));