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
			callback(err);
		} else {
			var bucketUrl = genS3Url(params.Bucket, params.Key);
			callback(null, {'s3Url': bucketUrl});
		}
	});
}

var formatInputUrl = function(url) {
	if ((url.indexOf('http://') <= -1) && ((url.indexOf('https://') <= -1)))
		return 'https://' + url;
}

// assumes S3 bucket statically hosted with valid website endpoint
var genS3Url = function(bucket, key) {
	return 'https://' + bucket + '/' + key;
}

exports.handler = function(event, context, callback) {

	console.log('event: ', JSON.stringify(event));

	var url = event.url;
	var format = event.format ? event.format : 'png';
	var zoom = event.zoom ? event.zoom : 1;
	var filename = sha1(url) + '.' + format;
	var size = event.size ? event.size : '';

	// Set the path as described here:
	// https://aws.amazon.com/blogs/compute/running-executables-in-aws-lambda/
	process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];

	// fail fast before executing phantom binary
	if (!url) {
		console.error('No content url provided.');
		return callback('Error: No content url provided');
	}

	var childArgs = [
		path.join(__dirname, 'rasterize.js'),
		url,
		format,
		zoom
	];

	if (size) {
		childArgs = childArgs.concat([size]);
	}

	// Set the path to the phantomjs binary
	var phantomPath = path.join(__dirname, 'phantomjs_linux-x86_64');

	var stderr = '';
	var stdout = '';

	// Launch PhantomJS as a child process
	console.log('calling phantom with params: ', phantomPath, childArgs);
	var child = childProcess.execFile(phantomPath, childArgs, {maxBuffer: 1024 * 4096}, function(error, stdout, stderr) {
		if (error !== null) {
			console.log('Error executing Phantom process: ', error.message);
			context.fail(error);
		}
	});
	
	// the screenshot data returns from the Phantom process
	child.stdout.on('data', function(data) {
		stdout += data;
	});

	child.stderr.on('data', function(data) {
		stderr += data;
		console.log('phantom stderr: ' + data);
	});

	child.on('exit', function(code) {
		console.log('child process exited with code ' + code);
		if (code !== 0) {
			return callback(stderr, 'phantom error');
		}
		// NOTE: deprecated as of Node 6.0
		var buffer = new Buffer(stdout, 'base64');
		return s3_upload_image(buffer, filename, callback);
	});
}