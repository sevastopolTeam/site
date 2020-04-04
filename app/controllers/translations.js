const remoteServer = require('../../config/remote_server');
const I18 = require('../../config/i18');

exports.index = function(request, response) {
    var serverResponse = remoteServer.request(
        "GET",
        "/api/english/admin/translations",
        {
            "Headers": {
                "Authorization": request.cookies["SessionToken"]
            }
        }
    );
    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.render('admin/translations/index', serverResponse);
    }
};

exports.view = function(request, response) {
    var serverResponse = remoteServer.request(
        "GET",
        "/api/english/admin/translations/" + request.params.id,
        {
            "Headers": {
                "Authorization": request.cookies["SessionToken"]
            }
        }
    );
    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.render('admin/translations/view', serverResponse["Body"]);
    }
};

exports.add = function(request, response) {
    response.render('admin/translations/add');
};

exports.edit = function(request, response) {
    var serverResponse = remoteServer.request(
        "GET",
        "/api/english/admin/translations/" + request.params.id,
        {
            "Headers": {
                "Authorization": request.cookies["SessionToken"]
            }
        }
    );
    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.render('admin/translations/edit', serverResponse["Body"]);
    }
};

exports.delete = function(request, response) {
    var serverResponse = remoteServer.request(
        "DELETE",
        "/api/english/admin/translations/" + request.params.id,
        {
            "Headers": {
                "Authorization": request.cookies["SessionToken"]
            }
        }
    );
    console.log(serverResponse);
    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.redirect('/admin/translations');
    }
};

exports.create = function(request, response) {
    var serverResponse = remoteServer.request(
        "POST",
        "/api/english/admin/translations",
        {
            "Params": {
                "ValueFrom": request.body.ValueFrom,
                "ValueTo": request.body.ValueTo,
                "LanguageFrom": request.body.LanguageFrom,
                "LanguageTo": request.body.LanguageTo,
                "OriginUrl": request.body.OriginUrl,
                "DownloadUrl": request.body.DownloadUrl
            },
            "Headers": {
                "Authorization": request.cookies["SessionToken"]
            }
        }
    );

    params = {
        Status: (serverResponse["Status"] == "Ok"),
        Request: request,
        ServerResponse: serverResponse,
        ValidationErrors: {}
    }

    if (serverResponse["Status"] == "ValidationError") {
        for (var key in serverResponse["ValidationErrors"]) {
            if (serverResponse["ValidationErrors"][key].length > 0) {
                params["ValidationErrors"][key] = I18.getValidationError(
                    "RU",
                    "AddTranslationPage",
                    key,
                    serverResponse["ValidationErrors"][key][0]
                )
            }
        }
    }
    response.render('admin/translations/add', params);
};