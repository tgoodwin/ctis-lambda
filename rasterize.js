// phantom script

var system = require('system');
var page = require('webpage').create();
// var argv = require('yargs').argv;

var SCREENSHOT_TIMEOUT = 1000;
var imgFormat = 'PNG';

page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) '
	+ 'Chrome/37.0.2062.120 Safari/537.36 FTBImageGenerator/1.0';

var defaultViewport = {width: 1440, height: 900};
page.viewportSize = defaultViewport;

// SET EVERYTHING.
// this solution is brittle, it's certainly bad
// i wanted something better but lambda got mad
// (was getting errors with 'yargs' parser module)
var url, format, zoom, size;
if (system.args.length >= 4) {
	url = system.args[1];
	format = system.args[2];
	zoom = system.args[3];
	if (system.args.length >= 5)
		size = system.args[4];
}

var argWidth, argHeight;
if (size) {
	var size = ('' + size).split('*');
	argWidth = size[0] ? parseInt(size[0], 10) : null;
	argHeight = size[1] ? parseInt(size[1], 10) : null;
	page.viewportSize = {
		width: argWidth ? argWidth : defaultViewport.width,
		height: argHeight ? argHeight : defaultViewport.height
	};
}

imgFormat = (format === 'jpg') ? 'JPEG' : 'PNG';
page.zoomFactor = zoom || 1;

var renderAndExit = function() {
	var contentWidth = page.evaluateJavaScript('function() {return document.body.firstElementChild.offsetWidth;}');
	var contentHeight = page.evaluateJavaScript('function() {return document.body.firstElementChild.offsetHeight;}');

	page.clipRect = {
		top: 0,
		left: 0,
		width: argWidth ? argWidth : contentWidth,
		height: argHeight ? argHeight : contentHeight
	};

	// wait a second for the page to load before screenshotting
	window.setTimeout(function() {
		var base64 = page.renderBase64(imgFormat);
		system.stdout.write(base64);
		phantom.exit(0);
	}, SCREENSHOT_TIMEOUT);
};

page.onResourceReceived = function(response) {
	if (response.status >= 400) {
		system.stderr.write('Phantom: resource failed with status code: ' + response.status);
		phantom.exit(1);
	}
};

// help us see potential server-side errors in the Lambda console
page.onResourceError = function(resourceError) {
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
