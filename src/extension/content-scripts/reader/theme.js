let theme;
const params = new URLSearchParams(window.location.search);
if (params.has('theme')) {
	theme = params.get('theme');
} else {
	if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
		theme = 'dark';
	} else {
		theme = 'light';
	}
}
document.documentElement.dataset['com_readup_theme'] = theme;
