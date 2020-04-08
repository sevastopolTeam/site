const remoteServer = require('../../config/remote_server');
const aws = require('../../config/aws_s3');
const helperArray = require('../../helpers/helper_array');
const helperController = require('../../helpers/helper_controller');

const pageSize = 15;

function prepareParamsForIndexPage(serverResponse) {
    return {
        "Translations": serverResponse.Body.Translations,
        "Pages": helperArray.getArrayRange(0, (serverResponse.Body.TranslationsCount - 1) / pageSize - 1)
    }
}

function prepareServerParamsForIndexPage(request) {
    var page = request.query.page;

    return {
        "Params": {
            "Page": page,
            "PageSize": pageSize
        },
        "Headers": {
            "Authorization": request.cookies["SessionToken"]
        }
    }
}

exports.index = function(request, response) {
    var serverResponse = remoteServer.get(
        "/api/english/admin/translations",
        prepareServerParamsForIndexPage(request)
    );
    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.render('admin/translations/index', prepareParamsForIndexPage(serverResponse));
    }
};

exports.view = function(request, response) {
    var serverResponse = remoteServer.get(
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
    var serverResponse = remoteServer.get(
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
    var serverResponse = remoteServer.delete(
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
        response.redirect('/admin/translations');
    }
};

exports.create = function(request, response) {
    var serverResponse = remoteServer.post(
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
        helperController.updateValidationErrors(
            params,
            serverResponse["ValidationErrors"],
            "RU",
            "AddTranslationPage"
        )
    }
    response.render('admin/translations/add', params);
};

exports.edit = function(request, response) {
    var serverResponse = remoteServer.get(
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
        serverResponse["Body"]["Id"] = request.params.id;
        response.render('admin/translations/edit', {
            "Request": {
                "body": serverResponse["Body"]
            }
        });
    }
};

exports.put = function(request, response) {
    downloadUrl = request.body.DownloadUrl;
    if (downloadUrl.length == 0 && request.body.OriginUrl.length > 0) {
        downloadUrl = aws.uploadByUrl(request.body.OriginUrl, request.body.ValueFrom + "_" + request.body.ValueTo);
    }
    var serverResponse = remoteServer.put(
        "/api/english/admin/translations",
        {
            "Params": {
                "Id": request.body.Id,
                "ValueFrom": request.body.ValueFrom,
                "ValueTo": request.body.ValueTo,
                "LanguageFrom": request.body.LanguageFrom,
                "LanguageTo": request.body.LanguageTo,
                "OriginUrl": request.body.OriginUrl,
                "DownloadUrl": downloadUrl
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
        helperController.updateValidationErrors(
            params,
            serverResponse["ValidationErrors"],
            "RU",
            "AddTranslationPage"
        )
    }
    if (serverResponse["Status"] == "Ok") {
        response.redirect("/admin/translations/" + request.body.Id);
    } else {
        response.render('admin/translations/edit', params);
    }
};
