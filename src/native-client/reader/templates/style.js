(function () {
	const style = window.document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = `{CSS_BUNDLE}`;
	window.document.body.append(style);
}());