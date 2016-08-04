// phantom script

var system = require('system');
var page = require('webpage').create();

var env = system.env;

page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) '
	+ 'Chrome/37.0.2062.120 Safari/537.36 FTBImageGenerator/1.0';

var defaultViewport = {width: 1440, height: 900};
page.viewportSize = defaultViewport;
page.zoomFactor = 1;

var url = system.args[1];

var renderAndExit = function() {
	var contentWidth = page.evaluateJavaScript('function() {return document.body.firstElementChild.offsetWidth;}');
	var contentHeight = page.evaluateJavaScript('function() {return document.body.firstElementChild.offsetHeight;}');
	
	page.clipRect = {
		top: 0,
		left: 0,
		width: contentWidth,
		height: contentHeight
	};

	// wait a second for the page to load before screenshotting
	window.setTimeout(function() {
		var base64 = page.renderBase64('PNG');
		system.stdout.write(base64);
		phantom.exit(0);
	}, 1000);
};
page.onResourceReceived = function(response) {
	if (response.status >= 400) {
		system.stderr.write('Phantom: resource failed with status code: ' + response.status);
		phantom.exit(1);
	}
};
page.onResourceError= function(resourceError) {
	page.reason = resourceError.errorString;
	page.reason_url = resourceError.url;
};

page.open(url, function (status) {
	if (status !== 'success') {
		system.stderr.write('Error opening url \'' + page.reason_url + '\': ' + page.reason);
		phantom.exit(1);
	} else {
		renderAndExit();
	}
});
