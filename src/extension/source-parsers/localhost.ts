window._getContentPageMetadata = () => ({
    url: window.location.href,
    title: document.body.getElementsByTagName('h1')[0].innerText,
    element: document.body
});