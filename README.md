#ContentToImageService on AWS Lambda

CTIS-Lambda provides a serverless variant to the original Graphiq CTIS. The basics:
- service is accessed via this API endpoint: https://jqq752twa8.execute-api.us-west-2.amazonaws.com/test/ctis 
- API endpoint handles `POST` requests containing a URL, invokes a Lambda function
- Lambda executes a PhantomJS process to take a screenshot of the input URL, uploads it to an AWS S3 bucket.
- API endpoint synchronously returns a link to the screenshot location on S3

##Setting Up Deployment
- The source code for the Lambda function exists in the `ctis-lambda` directory.
- Zip the _contents_ of the `ctis-lambda` directory and upload to Lambda using the AWS console or the AWS CLI.
- make sure the deployment package is globally readable.

	```
	cd ctis-lambda
	zip -r deployment.zip * && chmod 644 deployment.zip
	```

##Updating the Lambda function
Any updates to the ctis source code require  re-uploading a fresh deployment package to AWS Lambda.

A note on using npm nodules: All modules must be included within the deployment package at the time of upload, which can be achieved via `npm install --save <your_new_module>`.
To allow Lambda to properly access the `node_modules` directory, you must recursively set global permissions on the folder's contents: `chmod -R 777 node_modules`.

####Pre-Deploy Checklist:
- phantomjs binary has executable permissions: `chmod 777`
- javascript files are globally readable: `chmod 644`
- `node_modules` directory tree is globally accessible to Lambda: `chmod -R 777 node_modules`
- **you have zipped the _contents_ of the `ctis-lambda` directory, not the directory itself.**

##Deployment and Testing
####Uploading a deployment package to AWS Lambda:
- From the AWS Home Console, select `Lambda -> Functions` and then either "Create a New Function" or select an existing one and click `Upload` to **select** your zipped deployment package and then click `Save` to actually **upload** your package.

####Connecting the Lambda function to the CTIS API Endpoint:
- From the AWS Home Console, follow
	`AWS Home Console -> API Gateway -> ContentToImageService (in list of API's) -> Resources -> /ctis -> POST`.
- Next, click the "Integration Request" box and for `Integration Type` select `Lambda Function`.
- Select the region where your Lambda function was uploaded (most likely us-west-2) and then enter the name of the Lambda function (it should appear in the dropdown).


####Testing
- Since the CTIS Lambda function requires an input request, testing is done either through the AWS API Gateway console or through an external browser such as [postman](https://www.getpostman.com).
To get to the CTIS API Gateway,

	`AWS Home Console -> API Gateway -> ContentToImageService (in list of API's) -> Resources -> /ctis -> POST`

- Then, you should see a "Test" button with a blue lightning bolt under `/ctis - POST - Method Execution`. Enter a valid JSON input into the "Request Body" box and hit "Test". See [usage](#usage) for how to do this correctly. The Lambda function will spin up in the background, and once it finishes, you'll see all the CloudWatch logs as well as the return message all in the same window.

##Usage
The CTIS service is accessed by making POST requests to the API Endpoint: https://jqq752twa8.execute-api.us-west-2.amazonaws.com/test/ctis

When hitting the API outside of an AWS console, AWS credentials must be specified in the request header. [Postman](https://www.getpostman.com/) is a great tool for testing the API externally.

In the request body, 4 parameters can be specified as follows:
```javascript
{
    "url": "https://w.graphiq.com/w/gpyBSxYem6F",
    "format": "png",
    "size": "640*480"
    "zoom": 1
}
```
- `url` (**required**) is the url to the webpage to be screenshotted.
- `format` (optional) determines how the screenshot will render. 'png' and 'jpg' are supported.
- `size` (optional) sets the viewport size in pixels for the screnshot. `<width>*<height>` format is expected.
- `zoom` (optional) determines the browser zoom level at the time of screenshot.

The CTIS response to the POST request will be a URL to the image's location in S3
```javascript
{
  "s3Url": "https://ctis.graphiq.com/95185f1bcea4ebde112c4a906bbef259d501ac4e.png"
}
```

##Troubleshooting
Should an error be encountered, the CTIS Lambda is designed to provide helpful error messages in the AWS CloudWatch console, which can be accessed at

 `AWS Console Home -> Lambda -> Functions (list) -> contentToImage -> Monitoring (tab) -> View Logs in CloudWatch`

These hope to explain more straightforward usage errors, but some other cases may be encountered:
####Case: CTIS Lambda returns an image url, but it looks different:
- If you notice some font or layout differences between the screenshot and the actual webpage, this is likely due to the AWS runtime environment (Ubuntu). URLs may load differently in the phantomJS browser on Ubuntu vs Chrome on OSX, etc. Mitigating this issue involves sending URLs with content that don't rely on system resources and has good cross-browser compatability.

####Case: CTIS Lambda returns an image url, but it's missing content:
- If CTIS returns an image url without error but the image _itself_ is an error, this is likely due to the phantomJS process screenshotting your URL before the URL had enough time to render. The CTIS Phantom process currently gives a whole second of Lambda execution time for URLs to load properly, but you can try increasing this value in `rasterize.js`.

	```javascript
	window.setTimeout(function() {
		var base64 = page.renderBase64(imgFormat);
		system.stdout.write(base64);
		phantom.exit(0);
	}, 1000);
	```

####Case: CTIS Lambda returns an unhelpful error message or nothing at all:
- This case is almost always due to AWS Lambda not being able to execute the CTIS code. Two common errors of this type are
	1. Lambda can't execute the phantomjs binary and launch the browser as a child process (you might see "child exited before function could complete" in CloudWatch).
	2. Lambda can't open `index.js` or one of its dependencies.
- If the error comes after a recent Lambda redeployment, double check the **pre-deploy checklist**. `ls -al` on the deployment directory may come in handy. Otherwise, email tgoodwin@graphiq.com or dschnurr@graphiq.com.

###References:
------
[PhantomJS](http://phantomjs.org/)

[Building and Managing AWS Lambda-Based Applications](http://docs.aws.amazon.com/lambda/latest/dg/lambda-app.html)

[Programming Model (Node.js)](http://docs.aws.amazon.com/lambda/latest/dg/programming-model.html)

[Make Synchronous Calls to AWS Lambda](http://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started.html)
