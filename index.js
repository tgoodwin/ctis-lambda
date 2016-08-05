var childProcess = require('child_process');
var path = require('path');
var AWS = require('aws-sdk');
var sha1 = require('sha1');

var AWS_BUCKET_NAME = 'ctis-lambda-test';

// img_data is a Buffer, path is a filename
var s3_upload_image = function(img_data, path, callback) {
	var s3 = new AWS.S3();

	var params = {
		Body: img_data,
		Bucket: AWS_BUCKET_NAME,
		Key: path,
		ContentType: 'image/png'
	};

	s3.upload(params, function(err, data) {
		if (err) {
			callback(err, err.message);
		} else {
			var bucketUrl = genS3Url(params.Bucket, params.Key);
			callback(null, {'s3Url': bucketUrl});
		}
	});
}

// assumes S3 bucket being statically hosted
var genS3Url = function(bucket, key) {
	return 'https://' + bucket + '/' + key;
}

exports.handler = function(event, context, callback) {

	// Set the path as described here:
	// https://aws.amazon.com/blogs/compute/running-executables-in-aws-lambda/
	process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];

	// SET VALUES PASSED IN FROM API CALL
	var url = 'https://w.graphiq.com/w/hbegDLDcAnj';
	var format = (!!event.format) ? event.format : 'png';
	var size = !!(event.size) ? event.size : '';
	var filename = sha1(url) + '.' + 'png';
	
	var childArgs = [
		path.join(__dirname, 'rasterize.js'),
		url
	];

	// Set the path to the phantomjs binary
	var phantomPath = path.join(__dirname, 'phantomjs_linux-x86_64');

	
	var stderr = '';
	var stdout = '';

	// Launch PhantomJS as a child process
	console.log('calling phantom with params: ', phantomPath, childArgs);
	var child = childProcess.execFile(phantomPath, childArgs, function(error, stdout, stderr) {
		if (error !== null) {
			console.log('Error executing Phantom process: ', error.message);
			context.fail(error);
		}
	});
	
	// this should only be the base64 representation of the png screenshot.
	child.stdout.on('data', function(data) {
		stdout += data;
		console.log(data);
	});

	child.stderr.on('data', function(data) {
		stderr += data;
		console.log('phantom error: ' + data);
	});

	child.on('exit', function(code) {
		console.log('child process exited with code ' + code);
		if (code !== 0) {
			return callback(stderr, 'phantom error: ');
		}
		// DEPRECATED as of Node 6.0!!!
		var buffer = new Buffer(stdout, 'base64');
		return s3_upload_image(buffer, filename, callback);
		// return callback(null, stdout);
	});
}