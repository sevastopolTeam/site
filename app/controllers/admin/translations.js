const remoteServer = require('../../../config/remote_server');
const aws = require('../../../config/aws_s3');
const helperController = require('../../../helpers/helper_controller');

function prepareServerParamsForIndexPage(request) {
    var page = request.query.page;

    return {
        "Params": {
            "Page": page,
            "PageSize": helperController.PAGE_SIZE_DEFAULT
        },
        "Headers": helperController.getHeaders(request)
    }
}

function prepareServerParamsForCreatePage(request) {
    body = request.body
    downloadUrl = body.DownloadUrl;
    if (downloadUrl.length == 0 && body.OriginUrl.length > 0) {
        downloadUrl = aws.uploadByUrl(body.OriginUrl, body.ValueFrom + "_" + body.ValueTo);
    }
    result = {
        "Params": {
            "ValueFrom": body.ValueFrom,
            "ValueTo": body.ValueTo,
            "LanguageFrom": body.LanguageFrom,
            "LanguageTo": body.LanguageTo,
            "OriginUrl": body.OriginUrl,
            "DownloadUrl": downloadUrl,
            "PartOfSpeech": body.PartOfSpeech,
            "Frequency": body.Frequency,
            "IsChecked": body.IsChecked !== undefined
        },
        "Headers": helperController.getHeaders(request)
    }

    if (body.Id != undefined) {
        result["Params"]["Id"] = body.Id;
    }

    return result;
}

exports.index = function(request, response) {
    var serverResponse = remoteServer.get("/api/english/admin/translations", prepareServerParamsForIndexPage(request));

    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
    } else {
        response.render('admin/translations/index', helperController.prepareParams(request, "Admin.Translations.Index", {
            Translations: serverResponse.Body.Records,
            Pagination: helperController.getPaginationParams(
                serverResponse.Body.RecordsCount,
                request.query.page,
                helperController.PAGE_SIZE_DEFAULT
            )
        }));
    }
};

exports.view = function(request, response) {
    var serverResponse = remoteServer.get(
        "/api/english/admin/translations/" + request.params.id,
        { "Headers": helperController.getHeaders(request) }
    );
    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
        return;
    }

    response.render(
        'admin/translations/view',
        helperController.prepareParams(
            request,
            "Admin.Translations.View",
            { "Translation": serverResponse["Body"] }
        )
    );
};

exports.delete = function(request, response) {
    var serverResponse = remoteServer.delete(
        "/api/english/admin/translations/" + request.params.id,
        { "Headers": helperController.getHeaders(request) }
    );
    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
        return;
    }

    response.redirect('/admin/translations?page=' + request.query.page);
};

exports.add = function(request, response) {
    response.render(
        'admin/translations/add',
        helperController.prepareParams(request, "Admin.Translations.Add")
    );
};

exports.create = function(request, response) {
    var serverResponse = remoteServer.post("/api/english/admin/translations", prepareServerParamsForCreatePage(request));
    params = helperController.prepareParamsWithValidationErrors(request, "Admin.Translations.Add", serverResponse);
    if (params["Status"]) {
        response.redirect("/admin/translations/");
    } else {
        response.render('admin/translations/add', params);
    }
};

exports.edit = function(request, response) {
    var serverResponse = remoteServer.get(
        "/api/english/admin/translations/" + request.params.id,
        { "Headers": helperController.getHeaders(request) }
    );
    if (serverResponse["Error"] == "AccessDenied") {
        response.render('access_denied');
        return;
    }

    response.render(
        'admin/translations/edit',
        helperController.prepareParams(request, "Admin.Translations.Edit", { "Form": serverResponse["Body"]})
    )
};

exports.put = function(request, response) {
    var serverResponse = remoteServer.put("/api/english/admin/translations", prepareServerParamsForCreatePage(request));
    params = helperController.prepareParamsWithValidationErrors(request, "Admin.Translations.Edit", serverResponse);

    if (params["Status"]) {
        response.redirect("/admin/translations/" + request.body.Id);
    } else {
        response.render('admin/translations/edit', params);
    }
};
