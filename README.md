# ctis-lambda
#### A content-to-image service designed for AWS Lambda serverless backend.

This repository presents a *Lambda function* that uses the PhantomJS browser to open and screenshot an input url and upload the screenshot to Amazon S3.
The Lambda function (`index.js`) can be configured to sit behind an API Gateway POST endpoint, where a content URL is passed in the request body and a reference to its screenshot is returned synchronously all via AWS.
