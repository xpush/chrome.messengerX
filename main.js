function updateWebviews() {
  var webviews = document.querySelectorAll('webview');
  for (var i=0; i< webviews.length; i++) {
    var webview = webviews[i];
    webview.style.width = chrome.app.window.current().getBounds().width / ((i == 0) ? 2 : 4);
    webview.style.height = chrome.app.window.current().getBounds().height - 47;
    if (webview.dataset.userAgent)
      webview.setUserAgentOverride(webview.dataset.userAgent);
    webview.src = webview.dataset.url;
  }
};


chrome.app.window.onBoundsChanged.addListener(updateWebviews);
onload = updateWebviews;
