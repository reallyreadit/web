window._parse = () => {
    const article = document.getElementsByTagName('article')[0];
    const meta = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
    return {
        pageInfo: {
            url: meta.mainEntityOfPage,
            number: 1,
            article: {
                title: meta.name
            }
        },
        element: article
    };
};