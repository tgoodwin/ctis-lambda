# ctis-lambda
#### A content-to-image service designed for AWS Lambda serverless backend.

This repository presents a *Lambda function* that uses the PhantomJS browser to open and screenshot an input url and upload the screenshot to Amazon S3.
The Lambda function (`index.js`) can be configured to sit behind an AWS API Gateway endpoint, where a URL containing content is passed in a POST request body. A reference to the ensuing screenshot is returned synchronously in the POST response, all via AWS.
This service provides great scalability and maintainability improvements over contentional server-based application models.
