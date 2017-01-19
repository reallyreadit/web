window._getPageParams = (urlId: string) => {
    const article = document.getElementsByTagName('article')[0];
    const meta = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
    return {
        element: article,
        title: meta.name,
        url: meta.mainEntityOfPage,
        blockElements: article.querySelectorAll(window._standardBlockSelectors.join(',')),
        number: 1,
        pageLinks: []
    };
};