const request = require('sync-request');

exports.request = function(method, path, data = {}) {
    var res = request(
        method,
        "http://localhost:1234" + path,
        { headers: data["Headers"], json: data["Params"] }
    );

    return JSON.parse(res.getBody());
}