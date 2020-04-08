const AWS = require('aws-sdk');
const request = require('sync-request');
const env = require('../env.js');
 
const awsS3Client = new AWS.S3({
    accessKeyId: env.AWS_ACCESS_KEY,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region : env.AWS_REGION
});
 
const uploadParams = {
         Bucket: env.AWS_BUCKET, 
         Key: '',
         Body: null,
         ContentType: "image"
};
 
var upload = function(filename, filebody) {
    const s3Client = awsS3Client;
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
var uploadByUrl = function(url, name) {
    var res = request("GET", url);
    return upload(name, res.getBody());
}

exports.upload = upload;
exports.uploadByUrl = uploadByUrl;
