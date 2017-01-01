window._getPageParams = (urlId: string) => {
    const element = document.body.querySelector('main');
    return {
        element: element,
        url: window.location.href,
        blockElements: element.querySelectorAll(window._standardBlockSelectors.join(',')),
        number: 1,
        pageLinks: []
    };
};