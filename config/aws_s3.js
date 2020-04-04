const AWS = require('aws-sdk');
const env = require('../env.js');
 
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
 
var uploadToAWS = function(filename, filebody) {
    const s3Client = s3Client;
    const params = uploadParams;

    params.Key = filename;
    params.Body = filebody;

    var res = undefined;
    var isFinished = undefined;
    s3Client.upload(params, (err, data) => {
        if (err) {
            res = err;
        } {
            res = data;
        }
        isFinished = true;
    });

    // ждем выполнения асинхронной операции
    while(isFinished === undefined) {
        require('deasync').runLoopOnce();
    }
    return res["Location"];
}

// returns url in AWS
var uploadToAWSByUrl = function(url, name) {
    var res = request("GET", url);
    return uploadToAWS("test4.jpg", res.getBody());
}

exports.uploadToAWS = uploadToAWS;
exports.uploadToAWSByUrl = uploadToAWSByUrl;
