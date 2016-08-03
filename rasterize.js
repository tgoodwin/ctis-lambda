// phantom script

var system = require('system');
var page = require('webpage').create();

var env = system.env;

page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) '
	+ 'Chrome/37.0.2062.120 Safari/537.36 FTBImageGenerator/1.0';

var url = system.args[1];

// system.stdout.write('hello from phantom!');

page.onResourceReceived = function(response) {
	if (response.status >= 400) {
		system.stderr.write('fail!!!' + response.status);
		phantom.exit(1);
	}
};

page.open(url, function (status) {
	if (status !== 'success') {
		system.stderr.write('Error opening url');
		phantom.exit(1);
	}

	window.setTimeout(function() {
		var base64 = page.renderBase64('PNG');
		system.stdout.write(base64);
		phantom.exit(0); // we are done here!
	}, 1000);
});
