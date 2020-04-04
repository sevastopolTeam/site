const AWS = require('aws-sdk');
const env = require('./env.js');
 
const s3Client = new AWS.S3({
    accessKeyId: env.AWS_ACCESS_KEY,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  	region : env.AWS_REGION
});
 
const uploadParams = {
         Bucket: env.AWS_BUCKET, 
         Key: '', // pass key
         Body: null, // pass file body
};
 
const s3 = {};
s3.s3Client = s3Client;
s3.uploadParams = uploadParams;
 
module.exports = s3;