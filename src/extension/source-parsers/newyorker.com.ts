window._getContentPageMetadata = () => {
    const article = document.querySelector('[itemtype="http://schema.org/NewsArticle"]');
    return {
        url: article.querySelector('[itemprop="mainEntityOfPage"]').getAttribute('content'),
        title: article.querySelector('[itemprop="headline"]').textContent,
        element: article
    };
};