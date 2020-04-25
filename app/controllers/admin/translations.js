const remoteServer = require('../../../config/remote_server');
const aws = require('../../../config/aws_s3');
const helperArray = require('../../../helpers/helper_array');
const helperController = require('../../../helpers/helper_controller');

const pageSize = 15;

function prepareParamsForIndexPage(request, serverResponse) {
    var countPages = Math.ceil((serverResponse.Body.TranslationsCount) / pageSize);
    var currentPage = request.query.page == undefined ? 0 : request.query.page;

    return {
        Translations: serverResponse.Body.Translations,
        Pages: helperArray.getArrayRange(0, countPages - 1),
        CurrentPage: currentPage,
        Pagination: helperController.getPaginationParams(countPages, currentPage),
    };
}

function prepareServerParamsForIndexPage(request) {
    var page = request.query.page;

    return {
        "Params": {
            "Page": page,
            "PageSize": pageSize
        },
        "Headers": helperController.getHeaders(request)
    }
}

function prepareServerParamsForCreatePage(request) {
    downloadUrl = request.body.DownloadUrl;
    if (downloadUrl.length == 0 && request.body.OriginUrl.length > 0) {
        downloadUrl = aws.uploadByUrl(request.body.OriginUrl, request.body.ValueFrom + "_" + request.body.ValueTo);
    }
    result = {
        "Params": {
            "ValueFrom": request.body.ValueFrom,
            "ValueTo": request.body.ValueTo,
            "LanguageFrom": request.body.LanguageFrom,
            "LanguageTo": request.body.LanguageTo,
            "OriginUrl": request.body.OriginUrl,
            "DownloadUrl": downloadUrl,
            "PartOfSpeech": request.body.PartOfSpeech,
            "IsChecked": request.body.IsChecked !== undefined
        },
        "Headers": helperController.getHeaders(request)
    }

    if (request.body.Id != undefined) {
        result["Params"]["Id"] = request.body.Id;
    }

    return result;
}

exports.index = function(request, response) {
    var serverResponse = remoteServer.get("/api/english/admin/translations", prepareServerParamsForIndexPage(request));

    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.render('admin/translations/index', prepareParamsForIndexPage(request, serverResponse));
    }
};

exports.view = function(request, response) {
    var serverResponse = remoteServer.get(
        "/api/english/admin/translations/" + request.params.id,
        {
            "Headers": helperController.getHeaders(request)
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

exports.delete = function(request, response) {
    var serverResponse = remoteServer.delete(
        "/api/english/admin/translations/" + request.params.id,
        {
            "Headers": helperController.getHeaders(request)
        }
    );
    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.redirect('/admin/translations?page=' + request.query.page);
    }
};

exports.create = function(request, response) {
    var serverResponse = remoteServer.post("/api/english/admin/translations", prepareServerParamsForCreatePage(request));
    params = helperController.preparePostParams(serverResponse, request, "RU", "AddTranslationPage");
    if (params["Status"]) {
        response.redirect("/admin/translations/");
    } else {
        response.render('admin/translations/add', params);
    }
};

exports.edit = function(request, response) {
    var serverResponse = remoteServer.get(
        "/api/english/admin/translations/" + request.params.id,
        {
            "Headers": helperController.getHeaders(request)
        }
    );
    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.render('admin/translations/edit', {
            "Request": {
                "body": serverResponse["Body"]
            }
        });
    }
};

exports.put = function(request, response) {
    var serverResponse = remoteServer.put("/api/english/admin/translations", prepareServerParamsForCreatePage(request));
    params = helperController.preparePostParams(serverResponse, request, "RU", "AddTranslationPage");

    if (params["Status"]) {
        response.redirect("/admin/translations/" + request.body.Id);
    } else {
        response.render('admin/translations/edit', params);
    }
};
