window._getContentPageMetadata = () => {
    const article = document.getElementsByTagName('article')[0];
    const meta = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
    return {
        url: meta.mainEntityOfPage,
        title: meta.name,
        element: article
    };
};