window._getPageParams = (urlId: string) => ({
    element: document.body,
    url: window.location.href,
    blockElements: document.body.querySelectorAll(window._standardBlockSelectors.join(',')),
    number: 1,
    pageLinks: []
});