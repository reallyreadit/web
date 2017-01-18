window._getPageParams = (urlId: string) => ({
    element: document.body,
    title: document.body.getElementsByTagName('h1')[0].innerText,
    url: window.location.href,
    blockElements: document.body.querySelectorAll(window._standardBlockSelectors.join(',')),
    number: 1,
    pageLinks: []
});