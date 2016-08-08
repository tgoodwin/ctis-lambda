#ContentToImageService (CTIS) on AWS Lambda

This AWS Lambda webservice can
- Take a PNG screenshot and upload to an AWS S3 bucket

- Be accessed from anywhere via an API endpoint

##Setup and Deployment
- The source code for the Lambda function exists in the `ctis-lambda` directory.
- Zip the _contents_ of the `ctis-lambda` directory and upload to Lambda using the AWS console or the AWS CLI.

##Updating the Lambda function
Any updates to the ctis source code require uploading a new deployment package to the AWS Lambda console.

A note on using npm nodules: All modules must be included within the deployment package at the time of upload, which can be achieved by using `npm install --save <your_new_module>`

####Pre-Deploy Checklist:
- phantomjs binary has executable permissions ( requires a full `chmod 777` )
- javascript files are globally readable ( `chmod 644` )
- you have zipped the contents of the `ctis-lambda` directory, not the directory itself.
- 