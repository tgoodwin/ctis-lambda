var childProcess = require('child_process');
var path = require('path');

exports.handler = function(event, context) {
	console.log('HELLO');

	// Set the path as described here: https://aws.amazon.com/blogs/compute/running-executables-in-aws-lambda/
	process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];
	
	// Set the path to the phantomjs binary
	var phantomPath = path.join(__dirname, 'phantomjs_linux-x86_64');

	// Arguments for the phantom script
	var processArgs = [
		path.join(__dirname, 'rasterize.js'),
		'my arg'
	];
	
	// Launch the child process
	console.log('calling phantom: ', phantomPath, processArgs);
	var ls = childProcess.execFile(phantomPath, processArgs);
	
	ls.stdout.on('data', function(data) {
		console.log(data);
	});

	ls.stderr.on('data', function(data) {
		console.log('phantom error: ' + data);
	});

	ls.on('exit', function(code) {
		console.log('child process exited with code ' + code);
		context.done();
	});
}