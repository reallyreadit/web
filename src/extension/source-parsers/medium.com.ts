window._parse = () => {
    const articleEls = document.getElementsByTagName('article'),
          metaEl = document.querySelector('script[type="application/ld+json"]');
    if (articleEls.length === 1 && metaEl) {
        const metaData = JSON.parse(metaEl.textContent);
        return {
            pageInfo: {
                url: metaData.mainEntityOfPage,
                number: 1,
                article: {
                    title: metaData.name
                }
            },
            element: articleEls[0]
        };
    }
    return null;
};