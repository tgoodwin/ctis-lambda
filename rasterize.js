// phantom script

var system = require('system');
var page = require('webpage').create();

var env = system.env;
var args = system.args;

page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) '
	+ 'Chrome/37.0.2062.120 Safari/537.36 FTBImageGenerator/1.0';

var unusedArg = args[1]; // my arg

system.stdout.write('hello from phantom!');

phantom.exit(0);