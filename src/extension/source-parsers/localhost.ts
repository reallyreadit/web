window._parse = () => ({
    pageInfo: {
        url: window.location.href,
        number: 1,
        article: {
            title: document.body.getElementsByTagName('h1')[0].innerText
        },
    },
    element: document.body
});