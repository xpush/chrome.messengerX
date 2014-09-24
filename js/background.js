/*!
 * Webogram v0.3.0 - messaging web application for MTProto
 * https://github.com/zhukov/webogram
 * Copyright (C) 2014 Igor Zhukov <igor.beatle@gmail.com>
 * https://github.com/zhukov/webogram/blob/master/LICENSE
 */

chrome.app.runtime.onLaunched.addListener(function(launchData) {
  

  chrome.app.window.create('../index.html', {
    bounds: {
      width: 600,
      height: 800
    },
    minWidth: 600,
    minHeight: 800,
    frame: 'chrome'}
  ,function(win) {
  	console.log(win);


      win.contentWindow.onload = function() {

        
      };
    });
});
chrome.webRequest.onBeforeRequest.addListener(
		function (details){
			console.log(details);
			for (var i = 0; i < details.requestHeaders.length; ++i) {

		      if (details.requestHeaders[i].name === 'User-Agent') {
		        debugger;
		        details.requestHeaders.splice(i, 1);

		        break;

		      }

		    }
		},
        {urls: ["<all_urls>"]},
        ["blocking", "requestHeaders"]);
