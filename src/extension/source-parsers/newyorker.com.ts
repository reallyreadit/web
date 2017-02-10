window._parse = () => {
    const metaDataEl = document.querySelector('[itemtype="http://schema.org/NewsArticle"]');
    if (metaDataEl) {
        return {
            pageInfo: {
                url: metaDataEl.querySelector('[itemprop="mainEntityOfPage"]').getAttribute('content'),
                number: 1,
                article: {
                    title: metaDataEl.querySelector('[itemprop="headline"]').textContent
                }
            },
            element: metaDataEl
        };
    }
    return null;
};