// phantom script

var system = require('system');
var env = system.env;
var args = system.args;

var unusedArg = args[1]; // my arg

system.stdout.write('hello from phantom!');

phantom.exit(0);