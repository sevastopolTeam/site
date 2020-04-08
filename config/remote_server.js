const request = require('sync-request');
const env = require('../env.js');
const REMOTE_SERVER = env.REMOTE_SERVER

exports.request = function(method, path, data = {}) {
    var res = request(
        method,
        REMOTE_SERVER + path,
        { headers: data["Headers"], json: data["Params"] }
    );

    return JSON.parse(res.getBody());
}

exports.get = function(path, data = {}) {
    var res = request(
        "GET",
        REMOTE_SERVER + path,
        { headers: data["Headers"], qs: data["Params"] }
    );

    return JSON.parse(res.getBody());
}

exports.post = function(path, data = {}) {
    var res = request(
        "POST",
        REMOTE_SERVER + path,
        { headers: data["Headers"], json: data["Params"] }
    );

    return JSON.parse(res.getBody());
}

exports.delete = function(path, data = {}) {
    var res = request(
        "DELETE",
        REMOTE_SERVER + path,
        { headers: data["Headers"], json: data["Params"] }
    );

    return JSON.parse(res.getBody());
}

exports.put = function(path, data = {}) {
    var res = request(
        "PUT",
        REMOTE_SERVER + path,
        { headers: data["Headers"], json: data["Params"] }
    );

    return JSON.parse(res.getBody());
}