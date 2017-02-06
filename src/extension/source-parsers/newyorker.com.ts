window._parse = () => {
    const article = document.querySelector('[itemtype="http://schema.org/NewsArticle"]');
    return {
        pageInfo: {
            url: article.querySelector('[itemprop="mainEntityOfPage"]').getAttribute('content'),
            number: 1,
            article: {
                title: article.querySelector('[itemprop="headline"]').textContent
            }
        },
        element: article
    };
};