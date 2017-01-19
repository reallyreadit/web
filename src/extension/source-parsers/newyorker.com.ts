window._getPageParams = (urlId: string) => {
    const article = document.querySelector('[itemtype="http://schema.org/NewsArticle"]');
    return {
        element: article,
        title: article.querySelector('[itemprop="headline"]').textContent,
        url: article.querySelector('[itemprop="mainEntityOfPage"]').getAttribute('content'),
        blockElements: article.querySelector('[itemprop="articleBody"]').children,
        number: 1,
        pageLinks: []
    };
};