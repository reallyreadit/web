window._getPageParams = (urlId: string) => ({
    element: document.body,
    url: window.location.href,
    blockElements: document.body.querySelectorAll('p[word_count]'),
    number: 1,
    pageLinks: []
});