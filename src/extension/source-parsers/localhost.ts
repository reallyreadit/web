window._parse = () => {
    const h1Els = document.body.getElementsByTagName('h1');
    if (h1Els.length === 1) {
        return {
            pageInfo: {
                url: window.location.href,
                number: 1,
                article: {
                    title: h1Els[0].innerText
                },
            },
            element: document.body
        };
    }
    return null;
};